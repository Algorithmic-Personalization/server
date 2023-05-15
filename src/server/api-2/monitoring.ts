import {
	And,
	MoreThan,
	LessThanOrEqual,
	type DataSource,
} from 'typeorm';

import {type ParsedQs} from 'qs';

import {type RouteDefinition} from '../lib/routeCreation';

import RequestLog from '../models/requestLog';
import Event from '../../common/models/event';
import Session from '../../common/models/session';

import {type LogFunction} from './../lib/logger';
import {has} from '../../common/util';
import {showSql} from '../../util';

type ViewCount = {
	url: string;
	count: number;
};

export type MonitoringReport = {
	nPagesViewed: number;
	nUniqueParticipants: number;
	mostViewedPages: ViewCount[];
	averageLatency: number;
};

export type MonitoringQuery = {
	fromDate: Date;
	toDate: Date;
};

type TimeSeriesItem = {
	timestamp: number;
	value: number;
};

type TimeSeries = TimeSeriesItem[];

export type NumberSeries = {
	min: TimeSeries;
	max: TimeSeries;
	average: TimeSeries;
};

const getMostViewedPages = (dataSource: DataSource, log: LogFunction) => async ({fromDate, toDate}: MonitoringQuery): Promise<ViewCount[]> => {
	const show = showSql(log);

	const mostViewedPagesRaw = await show(
		dataSource.createQueryBuilder()
			.select('count(*)', 'count')
			.addSelect('url')
			.from(Event, 'e')
			.groupBy('url')
			.orderBy('count(*)', 'DESC')
			.where({
				createdAt: And(
					MoreThan(fromDate),
					LessThanOrEqual(toDate),
				),
			}).andWhere({
				type: 'PAGE_VIEW',
			}),
	).getRawMany();

	const mostViewedPages: ViewCount[] = [];

	for (const r of mostViewedPagesRaw) {
		if (typeof r !== 'object' || !r) {
			log('warning', 'unexpected result from most viewed pages query:', r);
			continue;
		}

		if (!has('url')(r)) {
			log('warning', 'unexpected result from most viewed pages query, no url found:', r);
			continue;
		}

		if (!has('count')(r)) {
			log('warning', 'unexpected result from most viewed pages query, no count found:', r);
			continue;
		}

		if (typeof r.url !== 'string') {
			log('warning', 'unexpected result from most viewed pages query, url is not a string:', r);
			continue;
		}

		const count = Number(r.count);

		if (isNaN(count)) {
			log('warning', 'unexpected result from most viewed pages query, count is not a number:', r);
			continue;
		}

		mostViewedPages.push({
			url: r.url,
			count,
		});
	}

	return mostViewedPages;
};

export const getLatencySeries = (dataSource: DataSource, log: LogFunction) => async ({fromDate, toDate}: MonitoringQuery): Promise<NumberSeries> => {
	const data = (await showSql(log)(
		dataSource
			.createQueryBuilder()
			.select('min(latency_ms)', 'min')
			.addSelect('max(latency_ms)', 'max')
			.addSelect('avg(latency_ms)', 'average')
			.where({
				createdAt: MoreThan(fromDate),
			}).andWhere({
				createdAt: LessThanOrEqual(toDate),
			}),
	).getRawOne() as unknown) as {
		min: string;
		max: string;
		average: string;
	};

	const repo = dataSource.getRepository(RequestLog);

	const min = Number(data.min);
	const max = Number(data.max);
	const average = Number(data.average);

	const minPoint = await repo.findOne({
		select: ['createdAt', 'latencyMs'],
		where: {
			createdAt: And(
				MoreThan(fromDate),
				LessThanOrEqual(toDate),
			),
			latencyMs: min,
		},
		order: {
			id: 'ASC',
		},
	});

	const maxPoint = await repo.findOne({
		select: ['createdAt', 'latencyMs'],
		where: {
			createdAt: And(MoreThan(fromDate), LessThanOrEqual(toDate)),
			latencyMs: max,
		},
		order: {
			id: 'DESC',
		},
	});

	const res: NumberSeries = {
		min: [],
		max: [],
		average: [],
	};

	if (minPoint) {
		const minItem: TimeSeriesItem = {
			timestamp: minPoint.createdAt.getTime(),
			value: minPoint.latencyMs,
		};

		res.min.push(minItem);
	}

	if (maxPoint) {
		const maxItem: TimeSeriesItem = {
			timestamp: maxPoint.createdAt.getTime(),
			value: maxPoint.latencyMs,
		};

		res.max.push(maxItem);
	}

	if (minPoint && maxPoint) {
		const avgItem: TimeSeriesItem = {
			timestamp: (minPoint.createdAt.getTime() + maxPoint.createdAt.getTime()) / 2,
			value: average,
		};

		res.average.push(avgItem);
	}

	return res;
};

const getReport = (dataSource: DataSource, log: LogFunction) => async ({fromDate, toDate}: MonitoringQuery): Promise<MonitoringReport> => {
	log('generating report from', fromDate, 'exclusive to', toDate, 'inclusive');
	const show = showSql(log);

	const requestRepo = dataSource.getRepository(RequestLog);

	const nPagesViewed = await requestRepo.count({
		where: {
			createdAt: And(
				MoreThan(fromDate),
				LessThanOrEqual(toDate),
			),
		},
	});

	const averageLatencyRes = await show(
		requestRepo.createQueryBuilder()
			.select('avg(latency_ms)', 'averageLatency')
			.where({
				createdAt: And(
					MoreThan(fromDate),
					LessThanOrEqual(toDate),
				),
			}),
	).getRawOne() as unknown;

	if (typeof averageLatencyRes !== 'object' || !averageLatencyRes) {
		log('error', 'Unexpected result from query: not an object', averageLatencyRes);
		throw new Error('Unexpected result from query: not an object');
	}

	if (!has('averageLatency')(averageLatencyRes)) {
		log('error', 'Unexpected result from query: missing averageLatency', averageLatencyRes);
		throw new Error('Unexpected result from query: missing averageLatency');
	}

	const averageLatency = Math.round(Number(averageLatencyRes.averageLatency));
	if (isNaN(averageLatency)) {
		log('error', 'Unexpected result from query: averageLatency is not a number', averageLatencyRes);
		throw new Error('Unexpected result from query: averageLatency is not a number');
	}

	const data = await show(
		dataSource.createQueryBuilder()
			.select('count(distinct participant_code)', 'nUniqueParticipants')
			.from(Event, 'e')
			.innerJoin(Session, 's', 'e.session_uuid = s.uuid')
			.where({
				createdAt: And(
					MoreThan(fromDate),
					LessThanOrEqual(toDate),
				)}),
	).getRawOne() as unknown;

	log('info', 'got data for number of unique participants:', data);

	if (typeof data !== 'object') {
		throw new Error('Unexpected result from query: not an object');
	}

	if (!has('nUniqueParticipants')(data)) {
		throw new Error('Unexpected result from query: missing nUniqueParticipants');
	}

	const nUniqueParticipants = Number(data.nUniqueParticipants);
	if (isNaN(nUniqueParticipants)) {
		throw new Error('Unexpected result from query: nUniqueParticipants is not a number');
	}

	const mostViewedPages = await getMostViewedPages(dataSource, log)({fromDate, toDate});

	return {
		nPagesViewed,
		nUniqueParticipants,
		mostViewedPages,
		averageLatency,
	};
};

const createGetQuery = (log: LogFunction) => (query: ParsedQs): MonitoringQuery | undefined => {
	const {fromDate: fromMs, toDate: toMs} = query;

	const from = Number(fromMs);
	const to = Number(toMs);

	let ok = true;

	if (isNaN(from)) {
		log('getQuery: invalid fromDate');
		ok = false;
	}

	if (isNaN(to)) {
		log('getQuery: invalid toDate');
		ok = false;
	}

	if (!ok) {
		return undefined;
	}

	const fromDate = new Date(from);
	const toDate = new Date(to);

	return {
		fromDate,
		toDate,
	};
};

const getDefaultQuery = (): MonitoringQuery => {
	const toDate = new Date();
	const fromDate = new Date(toDate.getTime() - (1000 * 60 * 60 * 24));

	return {
		fromDate,
		toDate,
	};
};

export const monitoringDefinition: RouteDefinition<MonitoringReport> = {
	verb: 'get',
	path: '/api/monitoring',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<MonitoringReport> => {
		const log = createLogger(req.requestId);

		log('info', 'received monitoring request', req.query);
		const getQuery = createGetQuery(log);

		const query = getQuery(req.query) ?? getDefaultQuery();

		const report = getReport(dataSource, log);

		return report(query);
	},
};

export default monitoringDefinition;

import {
	MoreThan,
	LessThanOrEqual,
	type DataSource,
	type SelectQueryBuilder,
	type ObjectLiteral,
} from 'typeorm';

import {type ParsedQs} from 'qs';

import {type RouteDefinition} from '../lib/routeCreation';

import RequestLog from '../models/requestLog';
import Event from '../../common/models/event';
import Session from '../../common/models/session';

import {type LogFunction} from './../lib/logger';
import {has} from '../../common/util';

type ViewCount = {
	url: string;
	count: number;
};

export type MonitoringReport = {
	nPagesViewed: number;
	nUniqueParticipants: number;
	mostViewedPages: ViewCount[];
};

export type MonitoringQuery = {
	fromDate: Date;
	toDate: Date;
};

export const showSql = (log: LogFunction) => <T extends ObjectLiteral>(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> => {
	const sql = qb.getSql();
	log('info', 'running query:', sql);
	return qb;
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
			.where([
				{createdAt: MoreThan(fromDate)},
				{createdAt: LessThanOrEqual(toDate)},
				{type: 'PAGE_VIEW'},
			]),
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

const getReport = (dataSource: DataSource, log: LogFunction) => async ({fromDate, toDate}: MonitoringQuery): Promise<MonitoringReport> => {
	log('generating report from', fromDate, 'exclusive to', toDate, 'inclusive');
	const show = showSql(log);

	const requestRepo = dataSource.getRepository(RequestLog);

	const nPagesViewed = await requestRepo.count({
		where: [{
			createdAt: MoreThan(fromDate),
		}, {
			createdAt: LessThanOrEqual(toDate),
		}],
	});

	const data = await show(
		dataSource.createQueryBuilder()
			.select('count(distinct participant_code)', 'nUniqueParticipants')
			.from(Event, 'e')
			.innerJoin(Session, 's', 'e.session_uuid = s.uuid')
			.where([
				{createdAt: MoreThan(fromDate)},
				{createdAt: LessThanOrEqual(toDate)},
			]),
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
	};
};

const getQuery = (query: ParsedQs): MonitoringQuery => {
	const {fromDate: fromMs, toDate: toMs} = query;

	if (typeof fromMs !== 'number') {
		throw new Error('Missing fromDate');
	}

	if (isNaN(fromMs)) {
		throw new Error('Invalid fromDate');
	}

	if (typeof toMs !== 'number') {
		throw new Error('Missing toDate');
	}

	if (isNaN(toMs)) {
		throw new Error('Invalid toDate');
	}

	const fromDate = new Date(fromMs);
	const toDate = new Date(toMs);

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

		log('info', 'received monitoring request');

		let query: MonitoringQuery;

		try {
			query = getQuery(req.query);
		} catch (e) {
			query = getDefaultQuery();
			log('warning', 'invalid query for report:', e);
		}

		const report = getReport(dataSource, log);

		return report(query);
	},
};

export default monitoringDefinition;

import {LessThan, MoreThan, type DataSource} from 'typeorm';

import {type RouteDefinition} from '../lib/routeCreation';

import RequestLog from '../models/requestLog';
import Event from '../../common/models/event';
import Session from '../../common/models/session';

import {type LogFunction} from './../lib/logger';
import {has} from '../../common/util';

type MonitoringReport = {
	nPagesViewed: number;
	nUniqueParticipants: number;
};

type MonitoringQuery = {
	fromDate: Date;
	toDate: Date;
};

const getReport = (dataSource: DataSource, log: LogFunction) => async ({fromDate, toDate}: MonitoringQuery): Promise<MonitoringReport> => {
	log('generating report from', fromDate, 'inclusive to', toDate, 'exclusive');

	const requestRepo = dataSource.getRepository(RequestLog);

	const nPagesViewed = await requestRepo.count({
		where: [{
			createdAt: MoreThan(fromDate),
		}, {
			createdAt: LessThan(toDate),
		}],
	});

	const data = await dataSource.createQueryBuilder()
		.select('count(distinct participant_id)', 'nUniqueParticipants')
		.from(Event, 'e')
		.innerJoin(Session, 's', 'e.session_uuid = s.uuid')
		.where('s.created_at > :startDate', {fromDate})
		// It's OK to use < here because endDate is tomorrow,
		// so if we query week after week, we won't double count
		// the same data and we should cover everything.
		.andWhere('s.created_at < :endDate', {toDate})
		.getRawOne() as unknown;

	if (typeof data !== 'object') {
		throw new Error('Unexpected result from query: not an object');
	}

	if (!has('nUniqueParticipants')(data)) {
		throw new Error('Unexpected result from query: missing nUniqueParticipants');
	}

	if (typeof data.nUniqueParticipants !== 'number') {
		throw new Error('Unexpected result from query: nUniqueParticipants is not a number');
	}

	return {
		nPagesViewed,
		nUniqueParticipants: data.nUniqueParticipants,
	};
};

export const monitoring: RouteDefinition<MonitoringReport> = {
	verb: 'get',
	path: '/api/monitoring',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<MonitoringReport> => {
		const log = createLogger(req.requestId);

		log('Received monitoring request');

		const now = new Date();
		const fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
		const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

		const report = getReport(dataSource, log);

		return report({fromDate, toDate});
	},
};

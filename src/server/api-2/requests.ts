import {RequestLog} from '../models/requestLog';
import {type RouteDefinition} from '../lib/routeCreation';
import {type ReadStream} from 'typeorm/platform/PlatformTools';

export const requests: RouteDefinition<ReadStream> = {
	verb: 'post',
	path: '/api/requests',
	makeHandler: ({createLogger, dataSource}) => async req => {
		const log = createLogger(req.requestId);

		log('info', 'received obtain requests log request', req.body);

		const {fromDate: fromMs, toDate: toMs} = req.body as Record<PropertyKey, unknown>;

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
			throw new Error('invalid query');
		}

		const fromDate = new Date(from);
		const toDate = new Date(to);

		const reqLogRepo = dataSource.getRepository(RequestLog);
		const reqLogQb = reqLogRepo
			.createQueryBuilder('rl')
			.where('verb = :verb', {verb: 'POST'})
			.andWhere('created_at >= :fromDate', {fromDate})
			.andWhere('created_at <= :toDate', {toDate})
			.select('rl.*');

		const requestsStream = await reqLogQb.stream();

		return requestsStream;
	},
};

export default requests;

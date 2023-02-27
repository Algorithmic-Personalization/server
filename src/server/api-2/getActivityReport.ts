import {type RouteDefinition} from '../lib/routeCreation';
import DailyActivityTime from '../models/dailyActivityTime';

export type ActivityReport = {
	latest: DailyActivityTime[];
};

export const createGetActivityReportDefinition: RouteDefinition<ActivityReport> = {
	verb: 'get',
	path: '/api/activity-report',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ActivityReport> => {
		const log = createLogger(req.requestId);
		log('Received get activity report request');

		const activityRepo = dataSource.getRepository(DailyActivityTime);
		const latestActivity = await activityRepo.find({
			order: {
				createdAt: 'DESC',
				updatedAt: 'DESC',
			},
			relations: ['participant'],
			take: 100,
		});

		return {
			latest: latestActivity,
		};
	},
};

export default createGetActivityReportDefinition;

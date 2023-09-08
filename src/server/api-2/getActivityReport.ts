import {type RouteDefinition} from '../lib/routeCreation';
import DailyActivityTime, {type DailyMetrics} from '../models/dailyActivityTime';

import {showSql, type LocalDateTime, localNow} from '../../util';

export type ActivityReport = {
	serverNow: LocalDateTime;
	latest: DailyActivityTime[];
	averages: DailyMetrics[];
	totals: DailyMetrics[];
};

export const createGetActivityReportDefinition: RouteDefinition<ActivityReport> = {
	verb: 'get',
	path: '/api/activity-report',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ActivityReport> => {
		const log = createLogger(req.requestId);
		log('Received get activity report request');
		const show = showSql(log);

		const activityRepo = dataSource.getRepository(DailyActivityTime);
		const latestActivity = await activityRepo.find({
			order: {
				createdAt: 'DESC',
				updatedAt: 'DESC',
			},
			relations: ['participant'],
			take: 100,
		});

		const data = await show(
			dataSource.createQueryBuilder()
				.from(DailyActivityTime, 'dat')
				.select('dat.created_at', 'day')
				.addSelect('avg(dat.pages_viewed)', 'avgPagesViewed')
				.addSelect('sum(dat.pages_viewed)', 'totalPagesViewed')
				.addSelect('avg(dat.video_pages_viewed)', 'avgVideoPagesViewed')
				.addSelect('sum(dat.video_pages_viewed)', 'totalVideoPagesViewed')
				.addSelect('avg(dat.video_time_viewed_seconds)', 'avgVideoTimeViewedSeconds')
				.addSelect('sum(dat.video_time_viewed_seconds)', 'totalVideoTimeViewedSeconds')
				.addSelect('avg(dat.time_spent_on_youtube_seconds)', 'avgTimeSpentOnYoutubeSeconds')
				.addSelect('sum(dat.time_spent_on_youtube_seconds)', 'totalTimeSpentOnYoutubeSeconds')
				.addSelect('avg(dat.sidebar_recommendations_clicked)', 'avgSidebarRecommendationsClicked')
				.addSelect('sum(dat.sidebar_recommendations_clicked)', 'totalSidebarRecommendationsClicked')
				.addSelect('count(distinct dat.participant_id)', 'nParticipants')
				.groupBy('dat.created_at')
				.orderBy('dat.created_at', 'DESC')
				.limit(15),
		).getRawMany();

		const n = (x: unknown) => {
			const v = Number(x);

			return Number.isNaN(v) ? 0 : v;
		};

		const d = (x: unknown) => {
			if (typeof x !== 'string' && !(x instanceof Date) && typeof x !== 'number') {
				return new Date(0);
			}

			const v = new Date(x);

			return Number.isNaN(v.getTime()) ? new Date(0) : v;
		};

		const averages = data.map(({day, ...rest}) => ({
			day: d(day),
			pagesViewed: Math.round(n(rest.avgPagesViewed)),
			videoPagesViewed: Math.round(n(rest.avgVideoPagesViewed)),
			videoTimeViewedSeconds: Math.round(n(rest.avgVideoTimeViewedSeconds)),
			timeSpentOnYoutubeSeconds: Math.round(n(rest.avgTimeSpentOnYoutubeSeconds)),
			sidebarRecommendationsClicked: Math.round(n(rest.avgSidebarRecommendationsClicked)),
			nParticipants: n(rest.nParticipants),
		}));

		const totals = data.map(({day, ...rest}) => ({
			day: d(day),
			pagesViewed: Math.round(n(rest.totalPagesViewed)),
			videoPagesViewed: Math.round(n(rest.totalVideoPagesViewed)),
			videoTimeViewedSeconds: Math.round(n(rest.totalVideoTimeViewedSeconds)),
			timeSpentOnYoutubeSeconds: Math.round(n(rest.totalTimeSpentOnYoutubeSeconds)),
			sidebarRecommendationsClicked: Math.round(n(rest.totalSidebarRecommendationsClicked)),
			nParticipants: n(rest.nParticipants),
		}));

		// D log('info', {averages, totals, data});

		return {
			serverNow: localNow(),
			latest: latestActivity,
			averages,
			totals,
		};
	},
};

export default createGetActivityReportDefinition;

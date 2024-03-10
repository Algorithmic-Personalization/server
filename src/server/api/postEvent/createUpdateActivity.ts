import {type Repository, LessThan, type DataSource} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import type Participant from '../../models/participant';
import Event from '../../../common/models/event';
import {EventType} from '../../../common/models/event';
import {type WatchTimeEvent} from '../../../common/models/watchTimeEvent';
import DailyActivityTime from '../../models/dailyActivityTime';
import {timeSpentEventDiffLimit, wholeDate} from '../../lib/updateCounters';
import {showSql} from '../../../util';
import {has} from '../../../common/util';
import {type ExternalNotifier} from '../../lib/externalNotifier';
import {createActivateExtension} from './createActivateExtension';

const getOrCreateActivity = async (
	repo: Repository<DailyActivityTime>,
	participantId: number,
	day: Date,
) => {
	const existing = await repo.findOneBy({
		participantId,
		createdAt: day,
	});

	if (existing) {
		return existing;
	}

	const newActivity = new DailyActivityTime();
	newActivity.participantId = participantId;
	newActivity.createdAt = day;

	return repo.save(newActivity);
};

export const createUpdateActivity = ({dataSource, notifier, log}: {
	dataSource: DataSource;
	notifier: ExternalNotifier;
	log: LogFunction;
}) => async (
	participant: Participant,
	event: Event,
) => {
	// These events do not trigger activity updates
	if (
		event.type !== EventType.PAGE_VIEW
		&& event.type !== EventType.WATCH_TIME
		&& event.type !== EventType.PERSONALIZED_CLICKED
		&& event.type !== EventType.NON_PERSONALIZED_CLICKED
		&& event.type !== EventType.MIXED_CLICKED
	) {
		// Bail out early to spare resources
		return;
	}

	// We want to lock the activity table later so that it is not updated concurrently
	const qr = dataSource.createQueryRunner();

	const day = wholeDate(event.createdAt);
	try {
		log(
			'info',
			'Updating activity for participant ',
			participant.code,
			'with event',
			event.type,
			'@',
			event.extensionVersion,
			'for day',
			day,
		);

		await qr.startTransaction();

		const activityRepo = qr.manager.getRepository(DailyActivityTime);
		const eventRepo = qr.manager.getRepository(Event);

		const activity = await getOrCreateActivity(activityRepo, participant.id, day);

		if (event.type === EventType.PAGE_VIEW) {
			const latestSessionEvent = await eventRepo
				.findOne({
					where: {
						sessionUuid: event.sessionUuid,
						createdAt: LessThan(event.createdAt),
						type: EventType.PAGE_VIEW,
					},
					order: {
						createdAt: 'DESC',
					},
				});

			const dt = latestSessionEvent
				? Number(event.createdAt) - Number(latestSessionEvent.createdAt)
				: 0;

			if (dt < timeSpentEventDiffLimit && dt > 0) {
				const dtS = dt / 1000;
				log('info', 'time since last event', dtS);
				activity.timeSpentOnYoutubeSeconds += dtS;
			}
		}

		if (event.type === EventType.WATCH_TIME) {
			activity.videoTimeViewedSeconds += (event as WatchTimeEvent).secondsWatched;
		}

		if (event.type === EventType.PAGE_VIEW) {
			activity.pagesViewed += 1;

			if (event.url.includes('/watch')) {
				activity.videoPagesViewed += 1;
			}
		}

		if (event.type === 'PERSONALIZED_CLICKED'
			|| event.type === 'NON_PERSONALIZED_CLICKED'
			|| event.type === 'MIXED_CLICKED') {
			activity.sidebarRecommendationsClicked += 1;
		}

		activity.updatedAt = new Date();

		log('info', 'Saving activity:', activity);

		await activityRepo.save(activity);

		/* Handle activation of extension */

		const isActiveParticipant = async (): Promise<boolean> => {
			// 3 pages viewed
			const minPagesViewed = 3;
			// 5 minutes spent on YouTube
			const minMinutesOnYouTube = 5;

			const qb = dataSource.createQueryBuilder();

			const show = showSql(log);

			const pagesViewed = await show(
				qb.select('SUM(pages_viewed)', 'pages_viewed')
					.from('daily_activity_time', 'dat')
					.where('dat.participant_id = :participantId', {participantId: participant.id}),
			).getRawOne() as unknown;

			log(`Pages viewed by ${participant.id}:`, pagesViewed);

			if (!has('pages_viewed')(pagesViewed)) {
				log('error', 'pages_viewed not found (while checking if participant is active)');
				return false;
			}

			const {pages_viewed: pagesViewedRaw} = pagesViewed;

			if (typeof pagesViewedRaw !== 'string' && pagesViewedRaw !== null) {
				log('error', 'pagesViewedRaw is not a string (while checking if participant is active)');
				return false;
			}

			const pagesViewedNum = pagesViewedRaw === null ? 0 : Number(pagesViewedRaw);

			if (isNaN(pagesViewedNum)) {
				log('error', 'pagesViewedNum is NaN (while checking if participant is active)');
				return false;
			}

			if (pagesViewedNum < minPagesViewed) {
				log('info', `Not enough pages viewed (need ${minPagesViewed}, got ${pagesViewedNum})`);
				return false;
			}

			// 5 minutes spent on youtube

			const timeSpentOnYouTubeSeconds = await show(
				qb.select('SUM(time_spent_on_youtube_seconds)', 'ts')
					.where('dat.participant_id = :participantId', {participantId: participant.id}),
			).getRawOne() as unknown;

			log(`Time spent on YouTube by ${participant.id} in seconds:`, timeSpentOnYouTubeSeconds);

			if (!has('ts')(timeSpentOnYouTubeSeconds)) {
				log('error', 'timeSpentOnYouTubeSeconds not found (while checking if participant is active)');
				return false;
			}

			const {ts: secondsOnYouTube} = timeSpentOnYouTubeSeconds;

			if (typeof secondsOnYouTube !== 'number') {
				log('error', 'secondsOnYouTube is not a number (while checking if participant is active)');
				return false;
			}

			const minutesOnYouTube = secondsOnYouTube / 60;

			if (minutesOnYouTube < minMinutesOnYouTube) {
				log('info', `Not enough minutes spent on YouTube (need ${minMinutesOnYouTube}, got ${minutesOnYouTube})`);
				return false;
			}

			log('info', `Participant ${participant.id} is active!`);

			return true;
		};

		if (participant.extensionActivatedAt === null && await isActiveParticipant()) {
			const activateExtension = createActivateExtension({
				dataSource,
				activityNotifier: notifier.makeParticipantNotifier({
					participantCode: participant.code,
					participantId: participant.id,
					isPaid: participant.isPaid,
				}),
				log,
			});

			activateExtension(event, participant).catch(e => {
				log('error', 'failed to activate extension [if needed]', e);
			});
		}

		await qr.commitTransaction();
	} catch (err) {
		log('error', 'while updating activity:', err);
		await qr.rollbackTransaction();
	} finally {
		await qr.release();
	}
};

export default createUpdateActivity;

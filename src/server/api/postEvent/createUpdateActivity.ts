import {type Repository, LessThan, type DataSource} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import Participant from '../../models/participant';
import Event from '../../../common/models/event';
import {EventType} from '../../../common/models/event';
import {type WatchTimeEvent} from '../../../common/models/watchTimeEvent';
import DailyActivityTime from '../../models/dailyActivityTime';
import {timeSpentEventDiffLimit, wholeDate} from '../../lib/updateCounters';
import {showSql} from '../../../util';
import {has} from '../../../common/util';
import {type ExternalNotifier} from '../../lib/externalNotifier';

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

export const createUpdateActivity = ({dataSource, activityRepo, eventRepo, notifier, log}: {
	dataSource: DataSource;
	activityRepo: Repository<DailyActivityTime>;
	eventRepo: Repository<Event>;
	notifier: ExternalNotifier;
	log: LogFunction;
}) => async (
	participant: Participant,
	event: Event,
) => {
	log('Updating activity for participant ', participant.code);
	const day = wholeDate(event.createdAt);

	const activity = await getOrCreateActivity(activityRepo, participant.id, day);

	if (event.type === EventType.PAGE_VIEW) {
		const latestSessionEvent = await eventRepo
			.findOne({
				where: {
					sessionUuid: event.sessionUuid,
					createdAt: LessThan(event.createdAt),
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
			log('Time since last event:', dtS);
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

		if (typeof pagesViewedRaw !== 'string') {
			log('error', 'pagesViewedRaw is not a string (while checking if participant is active)');
			return false;
		}

		const pagesViewedNum = Number(pagesViewedRaw);

		if (isNaN(pagesViewedNum)) {
			log('error', 'pagesViewedNum is NaN (while checking if participant is active)');
			return false;
		}

		log('Pages viewed:', pagesViewedNum);

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
		const qr = dataSource.createQueryRunner();

		try {
			await qr.startTransaction();
			const repo = qr.manager.getRepository(Participant);
			const p = await repo
				.createQueryBuilder('participant')
				.useTransaction(true)
				.setLock('pessimistic_write')
				.where({id: participant.id})
				.getOne();

			if (p === null) {
				throw new Error('Participant not found');
			}

			const activationEvent = new Event();
			Object.assign(activationEvent, event, {type: EventType.EXTENSION_ACTIVATED, id: 0});

			p.extensionActivatedAt = new Date();
			const [savedEvent] = await Promise.all([
				qr.manager.save(activationEvent),
				qr.manager.save(p),
			]);

			await qr.commitTransaction();

			log(
				'success',
				`Participant ${participant.id} activated extension, the following event was saved:`,
				savedEvent,
			);

			const n = notifier.makeParticipantNotifier({participantCode: participant.code});
			void n.notifyActive(activationEvent.createdAt);
		} catch (err) {
			log('error', 'while handling extension activity status determination or saving:', err);
			await qr.rollbackTransaction();
		} finally {
			await qr.release();
		}
	}
};

export default createUpdateActivity;

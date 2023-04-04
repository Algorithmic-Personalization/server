import {type Repository, LessThan} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import type Participant from '../../models/participant';
import type Event from '../../../common/models/event';
import {EventType} from '../../../common/models/event';
import {type WatchTimeEvent} from '../../../common/models/watchTimeEvent';
import DailyActivityTime from '../../models/dailyActivityTime';
import {timeSpentEventDiffLimit, wholeDate} from '../../lib/updateCounters';

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

export const createUpdateActivity = ({activityRepo, eventRepo, log}: {
	activityRepo: Repository<DailyActivityTime>;
	eventRepo: Repository<Event>;
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
};

export default createUpdateActivity;

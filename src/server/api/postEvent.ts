import {type DataSource, type Repository, MoreThan} from 'typeorm';

import {type RouteCreator} from '../lib/routeCreation';
import {type LogFunction} from '../lib/logger';

import Participant from '../models/participant';
import Event, {EventType} from '../../common/models/event';
import {type RecommendationsEvent} from '../../common/models/recommendationsEvent';
import {type WatchTimeEvent} from '../../common/models/watchTimeEvent';
import ExperimentConfig from '../../common/models/experimentConfig';
import Video from '../models/video';
import VideoListItem, {ListType, VideoType} from '../models/videoListItem';
import WatchTime from '../models/watchTime';

import type Recommendation from '../../common/types/Recommendation';

import {validateNew, has, validateExcept} from '../../common/util';
import DailyActivityTime from '../models/dailyActivityTime';
import {timeSpentEventDiffLimit, wholeDate} from '../lib/updateCounters';
import TransitionSetting, {Phase} from '../models/transitionSetting';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';

import {withLock} from '../../util';

const storeVideos = async (repo: Repository<Video>, videos: Video[]): Promise<number[]> => {
	const ids: number[] = [];

	for (const video of videos) {
		// eslint-disable-next-line no-await-in-loop
		const existing = await repo.findOneBy({
			youtubeId: video.youtubeId,
		});

		if (existing) {
			ids.push(existing.id);
		} else {
			const newVideo = new Video();
			Object.assign(newVideo, video);
			// eslint-disable-next-line no-await-in-loop
			await validateNew(newVideo);
			// eslint-disable-next-line no-await-in-loop
			const saved = await repo.save(newVideo);
			ids.push(saved.id);
		}
	}

	return ids;
};

const makeVideos = (recommendations: Recommendation[]): Video[] =>
	recommendations.map(r => {
		const v = new Video();
		v.youtubeId = r.videoId;
		v.title = r.title;
		v.url = r.url;
		return v;
	});

const storeItems = (repo: Repository<VideoListItem>, eventId: number) => async (
	videoIds: number[],
	listType: ListType,
	videoTypes: VideoType[],
) => {
	for (let i = 0; i < videoIds.length; i++) {
		const item = new VideoListItem();
		item.videoId = videoIds[i];
		item.listType = listType;
		item.videoType = videoTypes[i];
		item.position = i;
		item.eventId = eventId;
		// eslint-disable-next-line no-await-in-loop
		await validateNew(item);
		// eslint-disable-next-line no-await-in-loop
		await repo.save(item);
	}
};

const storeRecommendationsShown = async (
	log: LogFunction,
	dataSource: DataSource,
	event: RecommendationsEvent,
) => {
	log('Storing recommendations shown event meta-data');

	const videoRepo = dataSource.getRepository(Video);

	const nonPersonalized = await storeVideos(videoRepo, makeVideos(event.nonPersonalized));
	const personalized = await storeVideos(videoRepo, makeVideos(event.personalized));
	const shown = await storeVideos(videoRepo, makeVideos(event.shown));

	log('Non-personalized', nonPersonalized);
	log('Personalized', personalized);
	log('Shown', shown);

	const nonPersonalizedTypes = nonPersonalized.map(() => VideoType.NON_PERSONALIZED);
	const personalizedTypes = personalized.map(() => VideoType.PERSONALIZED);
	const shownTypes = event.shown.map(r => {
		if (r.personalization === 'non-personalized') {
			return VideoType.NON_PERSONALIZED;
		}

		if (r.personalization === 'personalized') {
			return VideoType.PERSONALIZED;
		}

		if (r.personalization === 'mixed') {
			return VideoType.MIXED;
		}

		throw new Error(`Invalid personalization type: ${r.personalization}`);
	});

	const itemRepo = dataSource.getRepository(VideoListItem);

	const store = storeItems(itemRepo, event.id);

	try {
		await store(nonPersonalized, ListType.NON_PERSONALIZED, nonPersonalizedTypes);
		await store(personalized, ListType.PERSONALIZED, personalizedTypes);
		await store(shown, ListType.SHOWN, shownTypes);
	} catch (err) {
		log('Error storing recommendations shown event meta-data', err);
	}
};

const storeWatchTime = async (
	log: LogFunction,
	dataSource: DataSource,
	event: WatchTimeEvent,
) => {
	const eventRepo = dataSource.getRepository(WatchTime);
	const watchTime = new WatchTime();
	watchTime.eventId = event.id;
	watchTime.secondsWatched = event.secondsWatched;
	try {
		await validateNew(watchTime);
		await eventRepo.save(watchTime);
	} catch (err) {
		log('Error storing watch time event meta-data', err);
	}
};

const isLocalUuidAlreadyExistsError = (e: unknown): boolean =>
	has('code')(e) && has('constraint')(e)
	&& e.code === '23505'
	&& e.constraint === 'event_local_uuid_idx';

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

const createUpdateActivity = ({activityRepo, eventRepo, log}: {
	activityRepo: Repository<DailyActivityTime>;
	eventRepo: Repository<Event>;
	log: LogFunction;
}) => async (
	participant: Participant,
	event: Event,
) => {
	log('Updating activity for participant ', participant.email);
	const day = wholeDate(event.createdAt);

	const activity = await getOrCreateActivity(activityRepo, participant.id, day);

	const latestSessionEvent = await eventRepo
		.findOne({
			where: {
				sessionUuid: event.sessionUuid,
				type: EventType.PAGE_VIEW,
			},
			order: {
				createdAt: 'DESC',
			},
		});

	const dt = latestSessionEvent
		? Number(event.createdAt) - Number(latestSessionEvent.createdAt)
		: 0;

	log('Time since last event:', dt / 1000);

	if (dt < timeSpentEventDiffLimit && dt > 0) {
		activity.timeSpentOnYoutubeSeconds += dt / 1000;
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

	if (
		event.type === 'PERSONALIZED_CLICKED'
		|| event.type === 'NON_PERSONALIZED_CLICKED'
		|| event.type === 'MIXED_CLICKED'
	) {
		activity.sidebarRecommendationsClicked += 1;
	}

	activity.updatedAt = new Date();

	await activityRepo.save(activity);
};

const activityMatches = (
	setting: TransitionSetting,
	activity: DailyActivityTime,
): boolean => {
	if (activity.timeSpentOnYoutubeSeconds >= setting.minTimeSpentOnYoutubeSeconds) {
		return true;
	}

	if (activity.videoTimeViewedSeconds >= setting.minVideoTimeViewedSeconds) {
		return true;
	}

	if (activity.pagesViewed >= setting.minPagesViewed) {
		return true;
	}

	if (activity.videoPagesViewed >= setting.minVideoPagesViewed) {
		return true;
	}

	if (activity.sidebarRecommendationsClicked >= setting.minSidebarRecommendationsClicked) {
		return true;
	}

	return false;
};

const shouldTriggerPhaseTransition = (
	setting: TransitionSetting,
	activities: DailyActivityTime[],
): TransitionEvent | undefined => {
	let matchingDays = 0;
	const transition = new TransitionEvent();

	for (const activity of activities) {
		const matches = activityMatches(setting, activity);

		if (matches) {
			matchingDays += 1;
			transition.timeSpentOnYoutubeSeconds += activity.timeSpentOnYoutubeSeconds;
			transition.videoTimeViewedSeconds += activity.videoTimeViewedSeconds;
			transition.pagesViewed += activity.pagesViewed;
			transition.videoPagesViewed += activity.videoPagesViewed;
			transition.sidebarRecommendationsClicked += activity.sidebarRecommendationsClicked;
		}
	}

	if (matchingDays >= setting.minDays) {
		return transition;
	}

	return undefined;
};

const createUpdatePhase = ({
	dataSource,
	log,
}: {
	dataSource: DataSource;
	log: LogFunction;
}) => async (participant: Participant, latestEvent: Event) => {
	log('updating participant phase if needed...');

	if (participant.phase === Phase.POST_EXPERIMENT) {
		log('participant in post-experiment, no need to check for phase transition, skipping');
		return;
	}

	// Find the right transition settings to apply

	const fromPhase = participant.phase;
	const toPhase = fromPhase === Phase.PRE_EXPERIMENT
		? Phase.EXPERIMENT
		: Phase.POST_EXPERIMENT;

	const transitionSettingRepo = dataSource.getRepository(TransitionSetting);

	const setting = await transitionSettingRepo.findOneBy({
		fromPhase,
		toPhase,
		isCurrent: true,
	});

	if (!setting) {
		log('/!\\ no transition setting from', fromPhase, 'to', toPhase, 'found, skipping - this is probably a bug or a misconfiguration');
		return;
	}

	log('transition setting from phase', fromPhase, 'to phase', toPhase, 'found:', setting);

	// Find the entry date of participant in the phase they're currently in

	const transitionRepo = dataSource.getRepository(TransitionEvent);

	const latestTransition = await transitionRepo.findOne({
		where: {
			toPhase: participant.phase,
			participantId: participant.id,
		},
		order: {
			id: 'DESC',
		},
	});

	const entryDate = latestTransition ? latestTransition.createdAt : participant.createdAt;

	// Get all statistics for the participant after entry into current phase

	const activityRepo = dataSource.getRepository(DailyActivityTime);

	const activities = await activityRepo.find({
		where: {
			participantId: participant.id,
			createdAt: MoreThan(entryDate),
		},
	});

	const transitionEvent = shouldTriggerPhaseTransition(setting, activities);

	if (transitionEvent) {
		log('triggering transition from phase', fromPhase, 'to phase', toPhase);

		const triggerEvent = new Event();
		Object.assign(triggerEvent, latestEvent);
		triggerEvent.id = 0;
		triggerEvent.type = EventType.PHASE_TRANSITION;

		transitionEvent.participantId = participant.id;
		transitionEvent.fromPhase = fromPhase;
		transitionEvent.toPhase = toPhase;
		transitionEvent.reason = TransitionReason.AUTOMATIC;
		transitionEvent.transitionSettingId = setting.id;

		participant.phase = toPhase;

		await dataSource.transaction(async manager => {
			const trigger = await manager.save(triggerEvent);
			transitionEvent.eventId = trigger.id;
			await manager.save(transitionEvent);
			await manager.save(participant);
		});
	} else {
		log('no transition needed at this point');
	}
};

const summarizeForDisplay = (event: Event): Record<string, unknown> => {
	const summary: Record<string, unknown> = {
		...event,
	};

	if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
		const e = event as RecommendationsEvent;
		summary.nonPersonalized = e.nonPersonalized.length;
		summary.personalized = e.personalized.length;
		summary.shown = e.shown.length;
	}

	return summary;
};

export const createPostEventRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('Received post event request');

	const {participantCode} = req;

	if (req.body.sessionUuid === undefined) {
		log('No session UUID found');
		res.status(500).json({kind: 'Failure', message: 'No session UUID found'});
		return;
	}

	if (typeof participantCode !== 'string' || !participantCode) {
		log('Invalid participant code');
		res.status(500).json({kind: 'Failure', message: 'No participant code found'});
		return;
	}

	const event = new Event();
	Object.assign(event, req.body);
	event.createdAt = new Date(event.createdAt);
	event.updatedAt = new Date(event.updatedAt);

	const participantRepo = dataSource.getRepository(Participant);
	const activityRepo = dataSource.getRepository(DailyActivityTime);
	const eventRepo = dataSource.getRepository(Event);

	const updateActivity = createUpdateActivity({
		activityRepo,
		eventRepo,
		log,
	});

	const updatePhase = createUpdatePhase({
		dataSource,
		log,
	});

	const participant = await participantRepo.findOneBy({
		code: participantCode,
	});

	if (!participant) {
		log('no participant found');
		res.status(500).json({kind: 'Failure', message: 'No participant found'});
		return;
	}

	const withParticipantLock = withLock(`participant-${participant.id}`);

	event.arm = participant.arm;
	event.phase = participant.phase;

	if (!event.experimentConfigId) {
		const configRepo = dataSource.getRepository(ExperimentConfig);
		const config = await configRepo.findOneBy({
			isCurrent: true,
		});

		if (!config) {
			log('no current config found');
			res.status(500).json({kind: 'Failure', message: 'No current config found'});
			return;
		}

		event.experimentConfigId = config.id;
	}

	const errors = await validateExcept('id', 'tabActive')(event);

	if (errors.length > 0) {
		log('event validation failed', errors);
		res.status(400).json({kind: 'Failure', message: `Event validation failed: ${errors.join(', ')}.`});
		return;
	}

	try {
		await withParticipantLock(async () => {
			await updateActivity(participant, event);
			await updatePhase(participant, event);
		});
	} catch (e) {
		log('activity update failed', e);
	}

	try {
		const e = await eventRepo.save(event);
		log('event saved', summarizeForDisplay(e));
		res.send({kind: 'Success', value: e});

		if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
			await storeRecommendationsShown(log, dataSource, event as RecommendationsEvent);
		} else if (event.type === EventType.WATCH_TIME) {
			await storeWatchTime(log, dataSource, event as WatchTimeEvent);
		}
	} catch (e) {
		if (isLocalUuidAlreadyExistsError(e)) {
			res.status(500).json({kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK'});
			return;
		}

		log('event save failed', e);

		res.status(500).json({kind: 'Failure', message: 'Event save failed'});
	}
};

export default createPostEventRoute;

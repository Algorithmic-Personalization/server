import {type DataSource, type Repository} from 'typeorm';

import {type RouteCreator} from '../lib/routeContext';
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

import {validateNew, has} from '../../common/util';

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

	if (!event.arm) {
		const participant = await participantRepo.findOneBy({
			code: participantCode,
		});

		if (!participant) {
			log('no participant found');
			res.status(500).json({kind: 'Failure', message: 'No participant found'});
			return;
		}

		event.arm = participant.arm;
	}

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

	const errors = await validateNew(event);

	if (errors.length > 0) {
		log('event validation failed', errors);
		res.status(400).json({kind: 'Failure', message: `Event validation failed: ${errors.join(', ')}.`});
		return;
	}

	try {
		const eventRepo = dataSource.getRepository(Event);
		const e = await eventRepo.save(event);
		log('event saved', e);
		res.send({kind: 'Success', value: e});

		if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
			await storeRecommendationsShown(log, dataSource, event as RecommendationsEvent);
		} else if (event.type === EventType.WATCH_TIME) {
			await storeWatchTime(log, dataSource, event as WatchTimeEvent);
		}
	} catch (e) {
		log('event save failed', e);

		if (isLocalUuidAlreadyExistsError(e)) {
			res.status(500).json({kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK'});
			return;
		}

		res.status(500).json({kind: 'Failure', message: 'Event save failed'});
	}
};

export default createPostEventRoute;

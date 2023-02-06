import {type DataSource} from 'typeorm';

import {type RouteCreator} from '../lib/routeContext';

import Participant from '../../common/models/participant';
import type ParticipantOverview from '../projections/ParticipantOverview';
import type SessionOverview from '../projections/SessionOverview';
import type EventOverview from '../projections/EventOverview';
import type RecommendationsList from '../projections/RecommendationsList';

import Event, {EventType} from '../../common/models/event';
import WatchTime from '../models/watchTime';
import Session from '../../common/models/session';
import VideoListItem, {ListType, VideoType} from '../models/videoListItem';
import Video from '../models/video';

const firstDate = <T extends {createdAt: Date}>(a: T[]): Date => {
	if (a.length === 0) {
		return new Date(0);
	}

	return a[0].createdAt;
};

const lastDate = <T extends {createdAt: Date}>(a: T[]): Date => {
	if (a.length === 0) {
		return new Date(0);
	}

	return a[a.length - 1].createdAt;
};

const asyncMap = <T, U>(array: T[]) => async (fn: (value: T) => Promise<U>): Promise<U[]> => {
	const result = [];

	// Voluntarily not doing it in parallel for now
	// in order to minimize server load
	for (const value of array) {
		// eslint-disable-next-line no-await-in-loop
		result.push(await fn(value));
	}

	return result;
};

const createVideoListGetter = (dataSource: DataSource) => {
	const videoRepo = dataSource.getRepository(Video);
	const cache = new Map<number, Video>();

	return async (ids: number[]): Promise<Video[]> => {
		const result: Video[] = [];

		for (const id of ids) {
			if (cache.has(id)) {
				result.push(cache.get(id)!);
			} else {
				// eslint-disable-next-line no-await-in-loop
				const video = await videoRepo.findOneBy({id});

				if (video) {
					cache.set(id, video);
					result.push(video);
				}
			}
		}

		return result;
	};
};

const createEventOverview = (dataSource: DataSource) => async (event: Event): Promise<EventOverview> => {
	const overview: EventOverview = {...event};

	if (event.type === EventType.WATCH_TIME) {
		const watchtimeRepo = dataSource.getRepository(WatchTime);

		const watchtime = await watchtimeRepo.findOneBy({eventId: event.id});

		if (watchtime) {
			overview.data = {
				kind: 'watchtime',
				watchtime: watchtime.secondsWatched,
			};
		}
	}

	if (event.type === EventType.RECOMMENDATIONS_SHOWN) {
		const videoListItemRepo = dataSource.getRepository(VideoListItem);

		const listItems = await videoListItemRepo.find({
			where: {
				eventId: event.id,
			},
			order: {
				position: 'ASC',
			},
		});

		const npIds: number[] = [];
		const pIds: number[] = [];
		const shownIds: number[] = [];
		const shownItems: VideoListItem[] = [];

		for (const listItem of listItems) {
			if (listItem.listType === ListType.NON_PERSONALIZED) {
				npIds.push(listItem.videoId);
			} else if (listItem.listType === ListType.PERSONALIZED) {
				pIds.push(listItem.videoId);
			} else {
				shownIds.push(listItem.videoId);
				shownItems.push(listItem);
			}
		}

		const getVideos = createVideoListGetter(dataSource);

		const npVideos = await getVideos(npIds);
		const pVideos = await getVideos(pIds);
		const shownVideos = await getVideos(shownIds);

		const recommendations: RecommendationsList = {
			nonPersonalized: npVideos.map(video => ({
				...video,
				source: VideoType.NON_PERSONALIZED,
			})),
			personalized: pVideos.map(video => ({
				...video,
				source: VideoType.PERSONALIZED,
			})),
			shown: shownVideos.map((video, i) => ({
				...video,
				source: shownItems[i].videoType,
			})),
		};

		overview.data = {
			kind: 'recommendations',
			recommendations,
		};
	}

	return overview;
};

const createSessionOverview = (dataSource: DataSource) => async (session: Session): Promise<SessionOverview> => {
	const eventRepo = dataSource.getRepository(Event);

	type QueryResult = {
		firstDate: Date;
		lastDate: Date;
		count: number;
	};

	const qResult = await eventRepo.createQueryBuilder()
		.select('MIN(created_at)', 'firstDate')
		.addSelect('MAX(created_at)', 'lastDate')
		.addSelect('COUNT(*)', 'count')
		.where('session_uuid = :sessionUuid', {sessionUuid: session.uuid})
		.getRawOne() as unknown as QueryResult | undefined;

	const startedAt = qResult ? qResult.firstDate : new Date(0);
	const endedAt = qResult ? qResult.lastDate : new Date(0);

	const events = await eventRepo.find({
		where: {
			sessionUuid: session.uuid,
		},
		order: {
			createdAt: 'DESC',
		},
	});

	return {
		...session,
		startedAt,
		endedAt,
		eventCount: qResult ? qResult.count : 0,
		events: await asyncMap<Event, EventOverview>(events)(createEventOverview(dataSource)),
	};
};

export const createGetParticipantOverviewRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received participant overview request');

	const participantRepo = dataSource.getRepository(Participant);

	const {email} = req.params;

	if (!email) {
		res.status(400).json({kind: 'Error', message: 'Missing email'});
		return;
	}

	const participant = await participantRepo.findOneBy({email});

	if (!participant) {
		res.status(404).json({kind: 'Error', message: 'Participant not found'});
		return;
	}

	const sessionRepo = dataSource.getRepository(Session);

	const sessions = await sessionRepo.find({
		where: {
			participantCode: participant.code,
		},
		order: {
			createdAt: 'DESC',
		},
	});

	log('Session count:', sessions.length);

	const participantOverview: ParticipantOverview = {
		...participant,
		sessionCount: sessions.length,
		firstSessionDate: firstDate(sessions),
		latestSessionDate: lastDate(sessions),
		sessions: await asyncMap<Session, SessionOverview>(sessions)(createSessionOverview(dataSource)),
	};

	res.status(200).json({kind: 'Success', value: participantOverview});
};

export default createGetParticipantOverviewRoute;

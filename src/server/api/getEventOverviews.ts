import {type DataSource} from 'typeorm';

import {type RouteCreator} from '../lib/routeContext';

import type EventOverview from '../projections/EventOverview';
import type RecommendationsList from '../projections/RecommendationsList';

import Event, {EventType} from '../../common/models/event';
import WatchTime from '../models/watchTime';
import VideoListItem, {ListType, VideoType} from '../models/videoListItem';
import Video from '../models/video';

import {asyncMap} from './getParticipantOverview';

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

export const createGetEventOverviewsRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received events overview request');

	const {sessionUuid} = req.params;

	if (!sessionUuid) {
		res.status(400).json({kind: 'Error', message: 'Missing sessionUuid'});
		return;
	}

	const eventRepo = dataSource.getRepository(Event);

	const events = await eventRepo.find({
		where: {
			sessionUuid,
		},
		order: {
			createdAt: 'DESC',
		},
	});

	const value = await asyncMap<Event, EventOverview>(events)(createEventOverview(dataSource));

	res.status(200).json({kind: 'Success', value});
};

export default createGetEventOverviewsRoute;

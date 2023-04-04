import {type DataSource, type Repository} from 'typeorm';
import {type LogFunction} from './logger';
import {type RecommendationsEvent} from '../../common/models/recommendationsEvent';
import Video from '../models/video';
import VideoListItem, {ListType, VideoType} from '../models/videoListItem';
import {validateNew} from '../../common/util';
import {makeVideosFromRecommendations, storeVideos} from './video/storeVideos';

const storeItems = (repo: Repository<VideoListItem>, eventId: number) => async (
	videoIds: number[],
	listType: ListType,
	videoTypes: VideoType[],
) => {
	const videoListItems: VideoListItem[] = [];

	for (let i = 0; i < videoIds.length; i++) {
		const item = new VideoListItem();
		item.videoId = videoIds[i];
		item.listType = listType;
		item.videoType = videoTypes[i];
		item.position = i;
		item.eventId = eventId;
		videoListItems.push(item);
	}

	await Promise.all(videoListItems.map(validateNew));
	await repo.save(videoListItems);
};

export const storeRecommendationsShown = async (
	log: LogFunction,
	dataSource: DataSource,
	event: RecommendationsEvent,
) => {
	log('Storing recommendations shown event meta-data');

	const videoRepo = dataSource.getRepository(Video);

	const [nonPersonalized, personalized, shown] = await Promise.all([
		storeVideos(videoRepo, makeVideosFromRecommendations(event.nonPersonalized)),
		storeVideos(videoRepo, makeVideosFromRecommendations(event.personalized)),
		storeVideos(videoRepo, makeVideosFromRecommendations(event.shown)),
	]);

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
		await Promise.all([
			store(nonPersonalized, ListType.NON_PERSONALIZED, nonPersonalizedTypes),
			store(personalized, ListType.PERSONALIZED, personalizedTypes),
			store(shown, ListType.SHOWN, shownTypes),
		]);
		log('Stored recommendations shown event meta-data');
	} catch (err) {
		log('Error storing recommendations shown event meta-data', err);
	}
};

export default storeRecommendationsShown;
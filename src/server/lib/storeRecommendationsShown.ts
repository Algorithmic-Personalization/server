import {type DataSource, type Repository} from 'typeorm';
import {type LogFunction} from './logger';
import {type RecommendationsEvent} from '../../common/models/recommendationsEvent';
import {type HomeShownEvent} from '../../common/models/homeShownEvent';
import Video from '../models/video';
import VideoListItem, {ListType, VideoType} from '../models/videoListItem';
import {validateNew} from '../../common/util';
import {makeVideosFromRecommendations, storeVideos} from './video/storeVideos';
import makeCreateYouTubeApi from './youTubeApi';
import {type YouTubeConfig} from './routeCreation';

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

type StoreRecommendationsShownParams = {
	log: LogFunction;
	dataSource: DataSource;
	event: RecommendationsEvent;
	youTubeConfig: YouTubeConfig;
};

type StoreHomeShownParams = {
	log: LogFunction;
	dataSource: DataSource;
	event: HomeShownEvent;
	youTubeConfig: YouTubeConfig;
};

const createYouTubeApi = makeCreateYouTubeApi();

const extractVideoIdFromUrl = (url: string): string | undefined => {
	const exp = /\?v=([^&]+)/;
	const m = exp.exec(url);

	if (m) {
		return m[1];
	}

	return undefined;
};

export const storeRecommendationsShown = async ({
	log,
	dataSource,
	event,
	youTubeConfig,
}: StoreRecommendationsShownParams) => {
	log('Storing recommendations shown event meta-data');

	const youTubeApi = await createYouTubeApi(youTubeConfig, log, dataSource);

	const videoRepo = dataSource.getRepository(Video);

	const [nonPersonalized, personalized, shown] = await Promise.all([
		storeVideos(videoRepo, makeVideosFromRecommendations(event.nonPersonalized)),
		storeVideos(videoRepo, makeVideosFromRecommendations(event.personalized)),
		storeVideos(videoRepo, makeVideosFromRecommendations(event.shown)),
	]);

	const urlId = extractVideoIdFromUrl(event.url);

	log('Retrieving meta-data information for videos recommended with', urlId ?? '<no url>...');
	const youTubeIds = [...new Set([
		...event.nonPersonalized.map(v => v.videoId),
		...event.personalized.map(v => v.videoId),
		...event.shown.map(v => v.videoId),
		urlId,
	])].filter(x => x !== undefined) as string[];

	try {
		await youTubeApi.getMetaFromVideoIds(youTubeIds).then(response => {
			log(`fetched ${
				response.data.size
			} meta-data items for ${
				youTubeIds.length
			} videos in ${
				response.stats.requestTime
			} ms.`);
		}).catch(err => {
			log('error fetching video meta-data', err);
		});
	} catch (err) {
		log('error fetching video meta-data', err);
	}

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

export const storeHomeShownVideos = async ({
	log,
	dataSource,
	event,
	youTubeConfig,
}: StoreHomeShownParams) => {
	log('Storing home shown videos');

	const itemRepo = dataSource.getRepository(VideoListItem);

	const store = storeItems(itemRepo, event.id);

	const videoRepo = dataSource.getRepository(Video);

	const storeVideoPromises = [
		storeVideos(videoRepo, makeVideosFromRecommendations(event.defaultRecommendations)),
		storeVideos(videoRepo, makeVideosFromRecommendations(event.replacementSource)),
	];

	if (event.shown) {
		storeVideoPromises.push(
			storeVideos(videoRepo, makeVideosFromRecommendations(event.shown)),
		);
	}

	const [defaultHome, replacement, shown] = await Promise.all(storeVideoPromises);

	await Promise.all([
		store(defaultHome, ListType.HOME_DEFAULT, defaultHome.map(() => VideoType.PERSONALIZED)),
		store(replacement, ListType.HOME_REPLACEMENT_SOURCE, replacement.map(() => VideoType.PERSONALIZED)),
		shown && store(shown, ListType.HOME_SHOWN, shown.map(() => VideoType.PERSONALIZED)),
	]);

	const youTubeApi = await createYouTubeApi(youTubeConfig, log, dataSource);

	const youTubeIds = [...new Set([
		...event.defaultRecommendations.map(v => v.videoId),
		...event.replacementSource.map(v => v.videoId),
		...event.shown?.map(v => v.videoId) ?? [],
	])].filter(x => x !== undefined);

	await youTubeApi.getMetaFromVideoIds(youTubeIds).catch(err => {
		log('error', 'fetching video meta-data', err);
	});
};

export default storeRecommendationsShown;

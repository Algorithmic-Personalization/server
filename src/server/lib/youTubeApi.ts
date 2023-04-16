import fetch, {type Response} from 'node-fetch';
import {type DataSource} from 'typeorm';
import {validate, IsString, IsInt, ValidateNested, type ValidationError, IsBoolean} from 'class-validator';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

import VideoCategory from '../models/videoCategory';
import VideoMetadata, {MetadataType} from '../models/videoMetadata';
import YouTubeRequestLatency from '../models/youTubeRequestLatency';

export type YouTubeMeta = {
	videoId: string;
	categoryId: string;
	categoryTitle: string;
	topicCategories: string[];
	tags?: string[];
};

export type MetaMap = Map<string, YouTubeMeta>;

class PageInfo {
	@IsInt()
		totalResults = 0;

	@IsInt()
		resultsPerPage = 0;
}

class YouTubeResponse<T> {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@ValidateNested()
		pageInfo?: PageInfo;

	@ValidateNested({each: true})
		items: T[] = [];
}

class TopicDetails {
	@IsString({each: true})
		topicCategories: string[] = [];
}

class VideoSnippet {
	@IsString()
		channelId = '';

	@IsString()
		categoryId = '';

	@IsString({each: true})
		tags?: string[] = [];
}

export class VideoListItem {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		topicDetails?: TopicDetails;

	@ValidateNested()
		snippet = new VideoSnippet();
}

class YouTubeVideoListResponse extends YouTubeResponse<VideoListItem> {
}

class CategorySnippet {
	@IsString()
		title = '';

	@IsBoolean()
		assignable = false;

	@IsString()
		channelId = '';
}

export class CategoryListItem {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		snippet = new CategorySnippet();
}

class YouTubeCategoryListResponse extends YouTubeResponse<CategoryListItem> {
}

// Compute a percentage from 0 to 100 as a number, with two decimal places
const pct = (numerator: number, denominator: number): number =>
	Number(Math.round(100 * numerator / denominator).toFixed(2));

export type YouTubeResponseMeta = {
	requestTimeMs: number;
	hitRate: number;
	failRate: number;
	data: MetaMap;
};

// TODO:
// - fetch category names (we only have the ID for now)
// - what's the thing with the regions for categories?
// - store the data in DB
// - check db to see if we already have the meta data for a video
// 	 to avoid unnecessary calls to the YouTube API
export const makeCreateYouTubeApi = () => {
	type PromisedResponseMap = Map<string, Promise<Response>>;
	type PromisedResponseSet = Set<Promise<Response>>;

	const metaCache: MetaMap = new Map();
	const categoriesCache = new Map<string, string>();

	const fetchingMeta: PromisedResponseMap = new Map();
	let fetchingCategories: Promise<unknown> | undefined;

	return (config: YouTubeConfig, log: LogFunction, dataSource?: DataSource) => {
		const latencyRepo = dataSource?.getRepository(YouTubeRequestLatency);
		const metaRepo = dataSource?.getRepository(VideoMetadata);
		const categoryRepo = dataSource?.getRepository(VideoCategory);

		const endpoint = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet`;

		const getUrlAndStoreLatency = async (url: string): Promise<Response> => {
			const tStart = Date.now();

			const res = fetch(url, {
				method: 'GET',
				headers: {
					accept: 'application/json',
				},
			});

			if (latencyRepo) {
				res.then(() => {
					const tElapsed = Date.now() - tStart;
					const latency = new YouTubeRequestLatency();
					latency.request = url;
					latency.latencyMs = tElapsed;
					latencyRepo.save(latency).catch(err => {
						log('error', 'Failed to save YouTube request latency', err);
					});
				}, err => {
					log('error', 'Failed to send request to YouTube', err);
				});
			}

			return res;
		};

		const api = {
			// TODO: split into multiple queries if the list of unique IDs is too long (> 50)
			async getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl = 'en'): Promise<YouTubeResponseMeta> {
				await fetchingCategories;

				const tStart = Date.now();
				const metaMap: MetaMap = new Map();
				const promisesToWaitFor: PromisedResponseSet = new Set();

				const youTubeIds = [...new Set(youTubeVideoIdsMaybeNonUnique)];
				const newIdsToFetch: string[] = [];

				for (const id of youTubeIds) {
					const cached = metaCache.get(id);
					if (cached) {
						metaMap.set(id, cached);
						continue;
					}

					const alreadyFetching = fetchingMeta.get(id);
					if (alreadyFetching) {
						promisesToWaitFor.add(alreadyFetching);
						continue;
					}

					newIdsToFetch.push(id);
				}

				const hits = youTubeIds.length - newIdsToFetch.length;

				const idsUrlArgs = newIdsToFetch.map(id => `id=${id}`).join('&');
				const finalUrl = `${endpoint}&${idsUrlArgs}&hl=${hl}`;
				const responseP = getUrlAndStoreLatency(finalUrl);

				for (const id of youTubeIds) {
					fetchingMeta.set(id, responseP);
					promisesToWaitFor.add(responseP);
				}

				const responses = await Promise.allSettled(promisesToWaitFor);

				const arrayResponses: Response[] = [];
				for (const response of responses) {
					if (response.status === 'rejected') {
						log('error getting some meta-data for videos:', response.reason);
					} else {
						arrayResponses.push(response.value);
					}
				}

				const rawResponses = await Promise.all(arrayResponses.map(async r => r.json()));

				const validationPromises: Array<Promise<ValidationError[]>> = [];
				const youTubeResponses: YouTubeVideoListResponse[] = [];

				for (const raw of rawResponses) {
					const youTubeResponse = new YouTubeVideoListResponse();
					Object.assign(youTubeResponse, raw);
					validationPromises.push(validate(youTubeResponse));
					youTubeResponses.push(youTubeResponse);
				}

				const validation = await Promise.allSettled(validationPromises);
				const metaToPersist: YouTubeMeta[] = [];

				validation.forEach((validationResult, i) => {
					if (validationResult.status === 'rejected') {
						log('error validating some meta-data for videos:', validationResult.reason);
					} else {
						const errors = validationResult.value;
						if (errors.length === 0) {
							const youTubeResponse = youTubeResponses[i];
							for (const item of youTubeResponse.items) {
								const meta: YouTubeMeta = {
									videoId: item.id,
									categoryId: item.snippet.categoryId,
									categoryTitle: categoriesCache.get(item.snippet.categoryId) ?? '<unknown>',
									topicCategories: item.topicDetails?.topicCategories ?? [],
									tags: item.snippet.tags,
								};
								metaToPersist.push(meta);
								metaMap.set(item.id, meta);
								metaCache.set(item.id, meta);
							}
						} else {
							log('errors validating some meta-data for videos:', errors);
						}
					}
				});

				const metaToPersistInOrder: VideoMetadata[] = [];

				if (metaRepo) {
					for (const meta of metaToPersist) {
						fetchingMeta.delete(meta.videoId);

						for (const topic of meta.topicCategories) {
							const metaData = new VideoMetadata();
							metaData.youtubeId = meta.videoId;
							metaData.value = topic;
							metaData.type = MetadataType.TOPIC_CATEGORY;
							metaToPersistInOrder.push(metaData);
						}

						if (meta.tags) {
							for (const tag of meta.tags) {
								const metaData = new VideoMetadata();
								metaData.youtubeId = meta.videoId;
								metaData.value = tag;
								metaData.type = MetadataType.TAG;
								metaToPersistInOrder.push(metaData);
							}
						}

						metaRepo.save(metaToPersistInOrder).catch(err => {
							log('error', 'Failed to save YouTube meta-data', err);
						});
					}
				}

				const fetchedIds = new Set(metaMap.keys());
				const failedIds = youTubeIds.filter(id => !fetchedIds.has(id));
				failedIds.forEach(id => fetchingMeta.delete(id));

				const failRate = pct(failedIds.length, youTubeIds.length);
				const hitRate = pct(hits, youTubeIds.length);
				const requestTimeMs = Date.now() - tStart;

				return {
					failRate,
					hitRate,
					requestTimeMs,
					data: metaMap,
				};
			},

			async getCategoriesFromRegionCode(regionCode: string, hl = 'en'): Promise<CategoryListItem[]> {
				const url = `${config.categoriesEndPoint}/?key=${config.apiKey}&part=snippet&regionCode=${regionCode}&hl=${hl}`;

				const response = await getUrlAndStoreLatency(url);
				const raw = await response.json() as unknown;

				const youTubeResponse = new YouTubeCategoryListResponse();
				Object.assign(youTubeResponse, raw);

				const errors = await validate(youTubeResponse);
				if (errors.length > 0) {
					throw new Error(`error validating YouTube category list response: ${errors.join(', ')}`);
				}

				return youTubeResponse.items;
			},
		};

		(async () => {
			if (categoriesCache.size > 0) {
				return;
			}

			if (dataSource) {
				const categoriesRepo = dataSource.getRepository(VideoCategory);
				const promise = categoriesRepo.find();
				fetchingCategories = promise;
				const categories = await promise;
				for (const category of categories) {
					categoriesCache.set(category.youtubeId, category.title);
				}

				return;
			}

			const promise = api.getCategoriesFromRegionCode('US');
			fetchingCategories = promise;
			const categories = await promise;
			for (const category of categories) {
				categoriesCache.set(category.id, category.snippet.title);
			}

			if (categoryRepo) {
				for (const category of categories) {
					const videoCategory = new VideoCategory();
					videoCategory.youtubeId = category.id;
					videoCategory.title = category.snippet.title;
					categoryRepo.save(videoCategory).catch(err => {
						log('error', 'Failed to save YouTube category', err);
					});
				}
			}
		})();

		return api;
	};
};

export default makeCreateYouTubeApi;

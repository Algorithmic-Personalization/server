import fetch, {type Response} from 'node-fetch';

import {
	type Repository,
	type DataSource,
	type InsertResult,
	type UpdateResult,
	In,
} from 'typeorm';

import {
	validate,
	IsBoolean,
	Min,
	IsDate,
	IsInt,
	IsNotEmpty,
	IsString,
	ValidateNested,
	type ValidationError,
} from 'class-validator';

import {Cache as MemoryCache} from 'memory-cache';
import sizeof from 'object-sizeof';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

import VideoCategory from '../models/videoCategory';
import VideoMetadata from '../models/videoMetadata';
import Video from '../models/video';
import YouTubeRequestLatency from '../models/youTubeRequestLatency';
import {formatSize, formatPct, pct, showInsertSql} from '../../util';
import {validateNew} from './../../common/util';

export type MetaMap = Map<string, VideoMetadata>;

const mergeInto = (target: MetaMap) => (source: MetaMap) => {
	for (const [key, value] of source) {
		target.set(key, value);
	}
};

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
	@IsNotEmpty()
		channelId = '';

	@IsString()
	@IsNotEmpty()
		categoryId = '';

	@IsDate()
	@IsNotEmpty()
		publishedAt = '';

	@IsString()
	@IsNotEmpty()
		title = '';

	@IsString()
		description = '';

	@IsString({each: true})
		tags?: string[] = [];
}

class VideoStatistics {
	@IsInt()
	@Min(0)
		viewCount = '0';

	@IsInt()
	@Min(0)
		likeCount = '0';

	@IsInt()
	@Min(0)
		commentCount = '0';
}

export class VideoListItem {
	@IsString()
	@IsNotEmpty()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
	@IsNotEmpty()
		id = '';

	@ValidateNested()
		topicDetails?: TopicDetails;

	@ValidateNested()
		snippet = new VideoSnippet();

	@ValidateNested()
		statistics = new VideoStatistics();
}

class YouTubeVideoListResponse extends YouTubeResponse<VideoListItem> {
}

class CategorySnippet {
	@IsString()
	@IsNotEmpty()
		title = '';

	@IsBoolean()
		assignable = false;

	@IsString()
		channelId = '';
}

export class CategoryListItem {
	@IsString()
	@IsNotEmpty()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
	@IsNotEmpty()
		id = '';

	@ValidateNested()
		snippet = new CategorySnippet();
}

class YouTubeCategoryListResponse extends YouTubeResponse<CategoryListItem> {
}

type Stats = {
	metadataRequestTimeMs: number;
	cacheHitRate: number;
	overAllCacheHitRate: string;
	dbHitRate: number;
	hitRate: number;
	failRate: number;
	cacheMemSizeBytes: number;
	cacheMemSizeString: string;
	cachedEntries: number;
	refetched: number;
};

export type YouTubeResponseMeta = Stats & {
	data: MetaMap;
};

const findYtInitialData = (html: string): string | undefined => {
	const startString = 'var ytInitialData = ';
	const startPos = html.indexOf(startString);

	if (startPos === -1) {
		return undefined;
	}

	const endPos = html.indexOf(';</script>', startPos);

	if (endPos === -1) {
		return undefined;
	}

	return html.slice(startPos + startString.length, endPos);
};

// TODO: non working
export const isVideoAvailable = async (youtubeId: string): Promise<boolean> => {
	const url = `https://www.youtube.com/watch?v=${youtubeId}`;

	const responseHtml = await (await fetch(url)).text();

	const jsonText = findYtInitialData(responseHtml);

	if (!jsonText) {
		return false;
	}

	const json = JSON.parse(jsonText) as unknown;

	if (typeof json !== 'object') {
		throw new Error('json is not an object');
	}

	const {contents} = json as {contents: unknown};

	if (typeof contents !== 'object') {
		throw new Error('content is not an object');
	}

	const {twoColumnWatchNextResults} = contents as {twoColumnWatchNextResults: unknown};

	if (typeof twoColumnWatchNextResults !== 'object') {
		throw new Error('twoColumnWatchNextResults is not an object');
	}

	const {secondaryResults} = twoColumnWatchNextResults as {secondaryResults: unknown};

	if (typeof secondaryResults !== 'object') {
		return false;
	}

	const {secondaryResults: inception} = secondaryResults as {secondaryResults: unknown};

	if (typeof inception !== 'object') {
		throw new Error('inception is not an object');
	}

	const {results} = inception as {results: unknown};

	return Array.isArray(results) && results.length > 0;
};

const getManyYoutubeMetas = (repo: Repository<VideoMetadata>) => async (youtubeIds: string[]): Promise<MetaMap> => {
	const items = await repo.find({
		where: {youtubeId: In(youtubeIds)},
	});

	return new Map(items.map(m => [m.youtubeId, m]));
};

const createPersistYouTubeMetas = (dataSource: DataSource, log: LogFunction) =>
	async (metaDataItems: VideoMetadata[]): Promise<InsertResult> => {
		const res = showInsertSql(log)(
			dataSource.createQueryBuilder()
				.insert()
				.into(VideoMetadata)
				.values(metaDataItems)
				.orUpdate(['view_count', 'like_count', 'comment_count', 'updated_at'], ['youtube_id']),
		).execute();

		const videoRepo = dataSource.getRepository(Video);

		videoRepo.createQueryBuilder()
			.update()
			.set({
				updatedAt: new Date(),
				metadataAvailable: true,
			})
			.where({
				youtubeId: In(metaDataItems.map(m => m.youtubeId)),
			})
			.execute().then(() => {
				log('successfully', 'marked', metaDataItems.length, 'videos as having metadata');
			}, () => {
				log('failed', 'to mark', metaDataItems.length, 'videos as having metadata');
			});

		return res;
	};

const intIfDefined = (str: string | undefined): number => {
	if (!str) {
		return 0;
	}

	const res = parseInt(str, 10);

	if (isNaN(res)) {
		throw new Error('invalid number: ' + str);
	}

	return res;
};

export type YtApi = {
	hasDataSource(): boolean;
	getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl?: string, recurse?: boolean): Promise<YouTubeResponseMeta>;
	getCategoriesFromRegionCode(regionCode: string, hl?: string): Promise<CategoryListItem[]>;
};

export const makeCreateYouTubeApi = (cache: 'with-cache' | 'without-cache' = 'with-cache') => {
	type PromisedResponseMap = Map<string, Promise<Response>>;
	type PromisedResponseSet = Set<Promise<Response>>;

	const useCache = cache === 'with-cache';

	const metaCache = new MemoryCache<string, VideoMetadata>();
	const categoriesCache = new Map<string, string>();

	const fetchingMeta: PromisedResponseMap = new Map();
	let fetchingCategories: Promise<unknown> | undefined;
	let totalCacheHitRate = 0;
	let numberOfCalls = 0;

	const getCacheMemSizeBytes = (): number =>
		metaCache
			.keys()
			.reduce((acc, key) => sizeof(metaCache.get(key)) + acc, 0);

	// TODO: cache items for less time if memory is low
	const cacheForMs = () => 1000 * 60 * 5; // 5 minutes

	return (config: YouTubeConfig, log: LogFunction, dataSource?: DataSource) => {
		const latencyRepo = dataSource?.getRepository(YouTubeRequestLatency);
		const metaRepo = dataSource?.getRepository(VideoMetadata);
		const categoryRepo = dataSource?.getRepository(VideoCategory);
		const persistMetas = dataSource
			? createPersistYouTubeMetas(dataSource, log)
			: undefined;

		const endpoint = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet&part=statistics`;

		const persistNonAvailable = async (youtubeIds: string[]): Promise<UpdateResult | undefined> => {
			if (!dataSource || youtubeIds.length === 0) {
				return;
			}

			const videoRepo = dataSource.getRepository(Video);

			return videoRepo.update({
				youtubeId: In(youtubeIds),
			}, {
				metadataAvailable: false,
			});
		};

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

		const api: YtApi = {
			hasDataSource(): boolean {
				return Boolean(dataSource);
			},
			// TODO: split into multiple queries if the list of unique IDs is too long (> 50)
			// eslint-disable-next-line complexity
			async getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl = 'en', recurse = true): Promise<YouTubeResponseMeta> {
				await fetchingCategories;
				const youTubeIds = [...new Set(youTubeVideoIdsMaybeNonUnique)];

				const tStart = Date.now();
				const metaMap: MetaMap = new Map();

				const promisesToWaitFor: PromisedResponseSet = new Set();

				const idsNotCached: string[] = [];

				let refetched = 0;

				for (const id of youTubeIds) {
					if (useCache) {
						const cached = metaCache.get(id);
						if (cached) {
							metaMap.set(id, cached);
							continue;
						}
					}

					const alreadyFetching = fetchingMeta.get(id);
					if (alreadyFetching) {
						promisesToWaitFor.add(alreadyFetching);
						continue;
					}

					idsNotCached.push(id);
				}

				const cacheHits = youTubeIds.length - idsNotCached.length;

				const dbMap = metaRepo
					? await getManyYoutubeMetas(metaRepo)(idsNotCached)
					: undefined;

				if (dbMap && idsNotCached.length > 0 && dbMap.size > 0) {
					const k = dbMap.keys().next().value as string;
					log(
						'info',
						'just showing one video as retrieved from the db for debugging purposes:',
						dbMap.get(k),
					);
				}

				const finalIdsToGetFromYouTube: string[] = [];

				for (const id of idsNotCached) {
					const dbCached = dbMap?.get(id);
					if (dbCached) {
						metaMap.set(id, dbCached);
						if (useCache) {
							metaCache.put(id, dbCached, cacheForMs());
						}

						continue;
					}

					finalIdsToGetFromYouTube.push(id);
				}

				const dbHits = idsNotCached.length - finalIdsToGetFromYouTube.length;

				const idsUrlArgs = finalIdsToGetFromYouTube.map(id => `id=${id}`).join('&');
				const finalUrl = `${endpoint}&${idsUrlArgs}&hl=${hl}`;

				const responseP = getUrlAndStoreLatency(finalUrl);

				for (const id of youTubeIds) {
					fetchingMeta.set(id, responseP);
					promisesToWaitFor.add(responseP);
				}

				const responses = await Promise.allSettled(promisesToWaitFor);

				const responseList = new Set<Response>();
				for (const response of responses) {
					if (response.status === 'rejected') {
						log('error getting some meta-data for videos:', response.reason);
					} else {
						responseList.add(response.value);
					}
				}

				log('info', 'waiting for raw responses from yt...');

				const rawResponses = (await Promise.all([...responseList].map(async r => r.json().catch(err => {
					log('error', 'Failed to parse YouTube response', err);
					return undefined;
				})))).filter(r => r) as unknown[];

				log('info', 'got raw responses from yt');

				const validationPromises: Array<Promise<ValidationError[]>> = [];
				const youTubeResponses: YouTubeVideoListResponse[] = [];

				for (const raw of rawResponses) {
					const youTubeResponse = new YouTubeVideoListResponse();
					Object.assign(youTubeResponse, raw);
					validationPromises.push(validate(youTubeResponse, {
						skipMissingProperties: false,
						forbidUnknownValues: false,
					}));
					youTubeResponses.push(youTubeResponse);
				}

				const validation = await Promise.allSettled(validationPromises);
				const metaToValidate: VideoMetadata[] = [];
				const itemsFromYouTube: VideoListItem[] = [];
				const metaValidationPromises: Array<Promise<string[]>> = [];

				validation.forEach((validationResult, i) => {
					if (validationResult.status === 'rejected') {
						log(
							'error validating the response from the YouTube API:',
							validationResult.reason,
							'response from YouTube was:',
							youTubeResponses[i],
						);
					} else {
						const errors = validationResult.value;
						if (errors.length === 0) {
							const {items} = youTubeResponses[i];

							log('debug', 'YouTube response page info:', youTubeResponses[i].pageInfo);

							if (!items || items.length === 0) {
								log(
									'error',
									'YouTube response did not contain items, API quota probably exceeded',
									youTubeResponses[i],
								);
							}

							for (const item of items) {
								itemsFromYouTube.push(item);

								const meta = new VideoMetadata();
								meta.youtubeId = item.id;
								meta.youtubeCategoryId = item.snippet.categoryId;
								meta.categoryTitle = categoriesCache.get(item.snippet.categoryId) ?? '<unknown>';
								meta.topicCategories = item.topicDetails?.topicCategories ?? [];
								meta.tags = item.snippet.tags ?? [];
								meta.videoTitle = item.snippet.title;
								meta.videoDescription = item.snippet.description;
								meta.publishedAt = new Date(item.snippet.publishedAt);
								meta.youtubeChannelId = item.snippet.channelId;
								meta.viewCount = intIfDefined(item.statistics.viewCount);
								meta.likeCount = intIfDefined(item.statistics.likeCount);
								meta.commentCount = intIfDefined(item.statistics.commentCount);

								metaToValidate.push(meta);
								metaValidationPromises.push(validateNew(meta));
							}
						} else {
							log('errors validating some meta-data for videos:', errors);
						}
					}
				});

				const metaToPersist: VideoMetadata[] = [];

				const metaValidations = await Promise.allSettled(metaValidationPromises);

				metaValidations.forEach((validationResult, i) => {
					if (validationResult.status === 'rejected') {
						log('error running the validation on video metadata:', validationResult.reason);
					} else {
						const errors = validationResult.value;
						const meta = metaToValidate[i];
						if (errors.length === 0) {
							metaToPersist.push(meta);

							metaMap.set(meta.youtubeId, meta);
							if (useCache) {
								metaCache.put(meta.youtubeId, meta, cacheForMs());
							}
						} else {
							log('errors validating video metadata before insert:', errors, {
								meta,
								item: itemsFromYouTube[i],
							});
						}
					}
				});

				if (persistMetas) {
					log('info', `persisting ${metaToPersist.length} video metas`);
					persistMetas(metaToPersist).then(res => {
						log('info', `persisted video metadata for ${res.identifiers.length} videos`);
					}, err => {
						log('error', 'error persisting video metadata:', err);
					});
				}

				const fetchedIds = new Set(metaMap.keys());
				const failedIds = youTubeIds.filter(id => !fetchedIds.has(id));
				failedIds.forEach(id => fetchingMeta.delete(id));

				const failRate = pct(failedIds.length, youTubeIds.length);
				const hitRate = pct(cacheHits + dbHits, youTubeIds.length);
				const dbHitRate = pct(dbHits, youTubeIds.length);
				const cacheHitRate = pct(cacheHits, youTubeIds.length);
				const requestTimeMs = Date.now() - tStart;

				totalCacheHitRate += cacheHitRate;
				++numberOfCalls;

				const cacheMemSizeBytes = getCacheMemSizeBytes();

				if (metaMap.size !== youTubeIds.length) {
					const message = `got meta-data back only for ${metaMap.size} of ${youTubeIds.length} videos`;

					const missing: string[] = [];
					for (const id of youTubeIds) {
						if (!metaMap.has(id)) {
							missing.push(id);
						}
					}

					log(
						'warning',
						message,
						'the missing ids are:',
						missing,
					);

					log('debug', 'trying to fetch the missing meta again');
					if (recurse) {
						const meta = await this.getMetaFromVideoIds(missing, hl, false);
						mergeInto(metaMap)(meta.data);
						refetched = meta.data.size;
					}
				}

				if (metaMap.size !== youTubeIds.length && (!recurse)) {
					const stillMissing = youTubeIds.filter(id => !metaMap.has(id));
					const available = await Promise.all(stillMissing.map(isVideoAvailable));

					const res = await persistNonAvailable(stillMissing.filter((_, i) => !available[i]));
					log('info', 'persisted non-available videos', res);
				}

				const stats: Stats = {
					metadataRequestTimeMs: requestTimeMs,
					failRate,
					dbHitRate,
					cacheHitRate,
					cacheMemSizeBytes,
					cacheMemSizeString: formatSize(cacheMemSizeBytes),
					cachedEntries: metaCache.size(),
					hitRate,
					overAllCacheHitRate: formatPct(totalCacheHitRate / numberOfCalls),
					refetched,
				};

				log('info', 'meta data gotten from yt, stats:', stats);

				return {
					...stats,
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

				if (categoriesCache.size > 0) {
					return;
				}
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

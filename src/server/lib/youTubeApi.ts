import fetch, {type Response} from 'node-fetch';
import {type Repository, type DataSource} from 'typeorm';
import {validate, IsString, IsInt, ValidateNested, type ValidationError, IsBoolean} from 'class-validator';
import {Cache as MemoryCache} from 'memory-cache';
import sizeof from 'object-sizeof';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

import VideoCategory from '../models/videoCategory';
import VideoMetadata, {MetadataType} from '../models/videoMetadata';
import YouTubeRequestLatency from '../models/youTubeRequestLatency';
import {formatSize} from '../../util';

export type YouTubeMeta = {
	videoId: string;
	categoryId: string;
	categoryTitle: string;
	topicCategories: string[];
	tags: string[];
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

const formatPct = (pctBetween0And100: number): string =>
	`${pctBetween0And100.toFixed(2)}%`;

// Compute a percentage from 0 to 100 as a number, with two decimal places
const pct = (numerator: number, denominator: number): number =>
	Number(Math.round(100 * numerator / denominator).toFixed(2));

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
};

export type YouTubeResponseMeta = Stats & {
	data: MetaMap;
};

const getYouTubeMeta = (repo: Repository<VideoMetadata>) => async (youtubeId: string): Promise<YouTubeMeta | undefined> => {
	const metaRows = await repo.find({where: {youtubeId}});

	if (metaRows.length === 0) {
		return undefined;
	}

	const meta: YouTubeMeta = {
		videoId: youtubeId,
		categoryId: '',
		categoryTitle: '',
		topicCategories: [],
		tags: [],
	};

	for (const row of metaRows) {
		switch (row.type) {
			case MetadataType.TAG:
				meta.tags.push(row.value);
				break;
			case MetadataType.TOPIC_CATEGORY:
				meta.topicCategories.push(row.value);
				break;
			case MetadataType.YT_CATEGORY_ID:
				meta.categoryId = row.value;
				break;
			case MetadataType.YT_CATEGORY_TITLE:
				meta.categoryTitle = row.value;
				break;
			default:
				// Here eslint fucks up, because the switch is exhaustive
				throw new Error('this should never happen');
		}
	}

	if (meta.categoryId.length > 0) {
		return meta;
	}

	return undefined;
};

const getManyYoutubeMetas = (repo: Repository<VideoMetadata>) => async (videoIds: string[]): Promise<MetaMap> => {
	const getOne = getYouTubeMeta(repo);
	const res: MetaMap = new Map();

	const metas = await Promise.all(videoIds.map(getOne));
	for (const meta of metas) {
		if (meta === undefined) {
			continue;
		}

		res.set(meta.videoId, meta);
	}

	return res;
};

// TODO: handle update?
const createPersistYouTubeMetas = (dataSource: DataSource, log: LogFunction) =>
	async (metaToPersistInOrder: VideoMetadata[]) => {
		const qr = dataSource.createQueryRunner();
		const youtubeIds = [...new Set(metaToPersistInOrder.map(m => m.youtubeId))];

		try {
			await qr.connect();
			await qr.startTransaction();
			const repo = qr.manager.getRepository(VideoMetadata);
			const metas = await repo
				.createQueryBuilder('m')
				.useTransaction(true)
				.setLock('pessimistic_write')
				.where({youtubeId: youtubeIds})
				.select('m.youtube_id')
				.getMany();

			const ignoreSet = new Set(metas.map(m => m.youtubeId));
			log('info', ignoreSet.size, 'metas already in DB, skipping them...');

			const insertList = metaToPersistInOrder.filter(m => !ignoreSet.has(m.youtubeId));
			const nVids = youtubeIds.length - ignoreSet.size;
			log('info', insertList.length, 'metas to insert in DB, corresponding to', nVids, 'videos ...');

			const res = await repo.insert(insertList);
			const inserted = res.identifiers.length;

			await qr.commitTransaction();

			log('info', inserted, 'metas inserted in DB or', pct(inserted, insertList.length), '%');
		} catch (e) {
			await qr.rollbackTransaction();
			throw e;
		} finally {
			await qr.release();
		}
	};

export type YtApi = {
	getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl?: string): Promise<YouTubeResponseMeta>;
	getCategoriesFromRegionCode(regionCode: string, hl?: string): Promise<CategoryListItem[]>;
};

export const makeCreateYouTubeApi = () => {
	type PromisedResponseMap = Map<string, Promise<Response>>;
	type PromisedResponseSet = Set<Promise<Response>>;

	const metaCache = new MemoryCache<string, YouTubeMeta>();
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

		const api: YtApi = {
			// TODO: split into multiple queries if the list of unique IDs is too long (> 50)
			async getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl = 'en'): Promise<YouTubeResponseMeta> {
				await fetchingCategories;
				const youTubeIds = [...new Set(youTubeVideoIdsMaybeNonUnique)];

				const tStart = Date.now();
				const metaMap: MetaMap = new Map();

				const promisesToWaitFor: PromisedResponseSet = new Set();

				const idsNotCached: string[] = [];

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

					idsNotCached.push(id);
				}

				const cacheHits = youTubeIds.length - idsNotCached.length;

				const dbMap = metaRepo
					? await getManyYoutubeMetas(metaRepo)(idsNotCached)
					: undefined;

				const finalIdsToGetFromYouTube: string[] = [];

				for (const id of idsNotCached) {
					const dbCached = dbMap?.get(id);
					if (dbCached) {
						metaCache.put(id, dbCached, cacheForMs());
						metaMap.set(id, dbCached);
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
									tags: item.snippet.tags ?? [],
								};
								metaToPersist.push(meta);
								metaMap.set(item.id, meta);
								metaCache.put(item.id, meta, cacheForMs());
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

						const categoryIdMeta = new VideoMetadata();
						categoryIdMeta.youtubeId = meta.videoId;
						categoryIdMeta.type = MetadataType.YT_CATEGORY_ID;
						categoryIdMeta.value = meta.categoryId;
						metaToPersistInOrder.push(categoryIdMeta);

						const categoryTitleMeta = new VideoMetadata();
						categoryTitleMeta.youtubeId = meta.videoId;
						categoryTitleMeta.type = MetadataType.YT_CATEGORY_TITLE;
						categoryTitleMeta.value = meta.categoryTitle;
						metaToPersistInOrder.push(categoryTitleMeta);

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
					}

					if (persistMetas) {
						persistMetas(metaToPersistInOrder).catch(err => {
							log('error', 'persisting video metadata:', err);
						});
					}
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

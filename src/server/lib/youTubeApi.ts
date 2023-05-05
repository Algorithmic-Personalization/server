import fetch, {type Response} from 'node-fetch';
import {type Repository, type DataSource} from 'typeorm';

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
import VideoMetadata, {MetadataType} from '../models/videoMetadata';
import YouTubeRequestLatency from '../models/youTubeRequestLatency';
import {formatSize, formatPct, pct} from '../../util';

export type YouTubeMeta = {
	videoId: string;
	channelId: string;
	categoryId: string;
	publishedAt: Date;
	categoryTitle: string;
	title: string;
	description: string;
	topicCategories: string[];
	tags: string[];
	statistics: {
		viewCount: number;
		likeCount: number;
		commentCount: number;
	};
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
		viewCount = -1;

	@IsInt()
	@Min(0)
		likeCount = -1;

	@IsInt()
	@Min(0)
		commentCount = -1;
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
		channelId: '',
		publishedAt: new Date(0),
		title: '',
		description: '',
		statistics: {
			viewCount: 0,
			likeCount: 0,
			commentCount: 0,
		},
	};

	for (const row of metaRows) {
		switch (row.type) {
			case MetadataType.TAG:
				meta.tags.push(row.value as string);
				break;
			case MetadataType.TOPIC_CATEGORY:
				meta.topicCategories.push(row.value as string);
				break;
			case MetadataType.YT_CATEGORY_ID:
				meta.categoryId = row.value as string;
				break;
			case MetadataType.YT_CATEGORY_TITLE:
				meta.categoryTitle = row.value as string;
				break;
			case MetadataType.TITLE:
				meta.title = row.value as string;
				break;
			case MetadataType.YT_CHANNEL_ID:
				meta.channelId = row.value as string;
				break;
			case MetadataType.PUBLISHED_AT:
				meta.publishedAt = row.value as Date;
				break;
			case MetadataType.VIEW_COUNT:
				meta.statistics.viewCount = row.value as number;
				break;
			case MetadataType.LIKE_COUNT:
				meta.statistics.likeCount = row.value as number;
				break;
			case MetadataType.COMMENT_COUNT:
				meta.statistics.commentCount = row.value as number;
				break;
			case MetadataType.DESCRIPTION:
				meta.description = row.value as string;
				break;
			default:
				throw new Error('unknown metadata type, should never happen');
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

const convertToVideoMetaData = (meta: YouTubeMeta): VideoMetadata[] => {
	const res: VideoMetadata[] = [];

	const categoryIdMeta = new VideoMetadata();
	categoryIdMeta.youtubeId = meta.videoId;
	categoryIdMeta.type = MetadataType.YT_CATEGORY_ID;
	categoryIdMeta.value = meta.categoryId;
	res.push(categoryIdMeta);

	const categoryTitleMeta = new VideoMetadata();
	categoryTitleMeta.youtubeId = meta.videoId;
	categoryTitleMeta.type = MetadataType.YT_CATEGORY_TITLE;
	categoryTitleMeta.value = meta.categoryTitle;
	res.push(categoryTitleMeta);

	const titleMeta = new VideoMetadata();
	titleMeta.youtubeId = meta.videoId;
	titleMeta.type = MetadataType.TITLE;
	titleMeta.value = meta.title;
	res.push(titleMeta);

	const descriptionMeta = new VideoMetadata();
	descriptionMeta.youtubeId = meta.videoId;
	descriptionMeta.type = MetadataType.DESCRIPTION;
	descriptionMeta.value = meta.description;
	res.push(descriptionMeta);

	const channelIdMeta = new VideoMetadata();
	channelIdMeta.youtubeId = meta.videoId;
	channelIdMeta.type = MetadataType.YT_CHANNEL_ID;
	channelIdMeta.value = meta.channelId;
	res.push(channelIdMeta);

	const publishedAtMeta = new VideoMetadata();
	publishedAtMeta.youtubeId = meta.videoId;
	publishedAtMeta.type = MetadataType.PUBLISHED_AT;
	publishedAtMeta.value = meta.publishedAt;
	res.push(publishedAtMeta);

	const viewCountMeta = new VideoMetadata();
	viewCountMeta.youtubeId = meta.videoId;
	viewCountMeta.type = MetadataType.VIEW_COUNT;
	viewCountMeta.value = meta.statistics.viewCount;
	res.push(viewCountMeta);

	const likeCountMeta = new VideoMetadata();
	likeCountMeta.youtubeId = meta.videoId;
	likeCountMeta.type = MetadataType.LIKE_COUNT;
	likeCountMeta.value = meta.statistics.likeCount;
	res.push(likeCountMeta);

	const commentCountMeta = new VideoMetadata();
	commentCountMeta.youtubeId = meta.videoId;
	commentCountMeta.type = MetadataType.COMMENT_COUNT;
	commentCountMeta.value = meta.statistics.commentCount;
	res.push(commentCountMeta);

	for (const topic of meta.topicCategories) {
		const metaData = new VideoMetadata();
		metaData.youtubeId = meta.videoId;
		metaData.value = topic;
		metaData.type = MetadataType.TOPIC_CATEGORY;
		res.push(metaData);
	}

	if (meta.tags) {
		for (const tag of meta.tags) {
			const metaData = new VideoMetadata();
			metaData.youtubeId = meta.videoId;
			metaData.value = tag;
			metaData.type = MetadataType.TAG;
			res.push(metaData);
		}
	}

	return res;
};

type MapLike<K, V> = {
	set: (key: K, value: V) => void;
} & Iterable<[K, V]>;

const mergeInto = <K, V>(target: MapLike<K, V>) => (source: MapLike<K, V>) => {
	for (const [key, value] of source) {
		target.set(key, value);
	}
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
			if (ignoreSet.size > 0) {
				log('info', ignoreSet.size, 'metas already in DB, skipping them...');
			}

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
	getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl?: string, recurse?: boolean): Promise<YouTubeResponseMeta>;
	getCategoriesFromRegionCode(regionCode: string, hl?: string): Promise<CategoryListItem[]>;
};

export const makeCreateYouTubeApi = (cache: 'with-cache' | 'without-cache' = 'with-cache') => {
	type PromisedResponseMap = Map<string, Promise<Response>>;
	type PromisedResponseSet = Set<Promise<Response>>;

	const useCache = cache === 'with-cache';

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

		const endpoint = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet&part=statistics`;

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

				if (idsNotCached.length > 0 && dbMap) {
					log(
						'info',
						'just showing one video as retrieved from the db for debugging purposes:',
						dbMap.get(idsNotCached[0]),
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
					validationPromises.push(validate(youTubeResponse, {
						skipMissingProperties: false,
						forbidUnknownValues: false,
					}));
					youTubeResponses.push(youTubeResponse);
				}

				const validation = await Promise.allSettled(validationPromises);
				const metaToPersist: YouTubeMeta[] = [];

				validation.forEach((validationResult, i) => {
					if (validationResult.status === 'rejected') {
						log(
							'error validating some meta-data for videos:',
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
								const meta: YouTubeMeta = {
									videoId: item.id,
									categoryId: item.snippet.categoryId,
									categoryTitle: categoriesCache.get(item.snippet.categoryId) ?? '<unknown>',
									topicCategories: item.topicDetails?.topicCategories ?? [],
									tags: item.snippet.tags ?? [],
									title: item.snippet.title,
									description: item.snippet.description,
									publishedAt: new Date(item.snippet.publishedAt),
									channelId: item.snippet.channelId,
									statistics: item.statistics,
								};
								metaToPersist.push(meta);
								metaMap.set(item.id, meta);
								if (useCache) {
									metaCache.put(item.id, meta, cacheForMs());
								}
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
						metaToPersistInOrder.push(...convertToVideoMetaData(meta));
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

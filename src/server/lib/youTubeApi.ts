import {google} from 'googleapis';

import fetch from 'node-fetch';

import {
	type DataSource,
	type InsertResult,
	In,
} from 'typeorm';

import {Cache as MemoryCache} from 'memory-cache';
import sizeof from 'object-sizeof';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

import VideoCategory from '../models/videoCategory';
import VideoMetadata from '../models/videoMetadata';
import Video from '../models/video';
import YouTubeRequestLatency from '../models/youTubeRequestLatency';
import {formatSize, pct} from '../../util';

export type VideoMetaMap = Map<string, VideoMetadata>;

type Stats = {
	videoCount: number;
	requestTime: number;
	cacheHitRate: number;
	dbHitRate: number;
	hitRate: number;
	failRate: number;
	cacheMemSizeBytes: number;
	cacheSizeHumanReadable: string;
	cachedEntries: number;
};

export type YouTubeVideoMetaResponse = {
	data: VideoMetaMap;
	stats: Stats;
};

const mergeStats = (a: Stats, b: Stats): Stats => {
	const res: Stats = {
		videoCount: a.videoCount + b.videoCount,
		requestTime: a.requestTime + b.requestTime,
		cacheHitRate: (
			(a.cacheHitRate * a.videoCount) + (b.cacheHitRate * b.videoCount)
		) / (a.videoCount + b.videoCount),
		dbHitRate: (
			(a.dbHitRate * a.videoCount) + (b.dbHitRate * b.videoCount)
		) / (a.videoCount + b.videoCount),
		hitRate: (
			(a.hitRate * a.videoCount) + (b.hitRate * b.videoCount)
		) / (a.videoCount + b.videoCount),
		failRate: (
			(a.failRate * a.videoCount) + (b.failRate * b.videoCount)
		) / (a.videoCount + b.videoCount),
		cacheMemSizeBytes: b.cacheMemSizeBytes,
		cacheSizeHumanReadable: formatSize(b.cacheMemSizeBytes),
		cachedEntries: b.cachedEntries,
	};

	return res;
};

const mergeData = (a: VideoMetaMap, b: VideoMetaMap): VideoMetaMap =>
	new Map([
		...a,
		...b,
	]);

const mergeResponses = (a: YouTubeVideoMetaResponse, b: YouTubeVideoMetaResponse): YouTubeVideoMetaResponse => {
	const stats = mergeStats(a.stats, b.stats);
	const data = mergeData(a.data, b.data);

	return {
		stats,
		data,
	};
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

// TODO: to be tested better
export const isVideoAvailable = async (youtubeId: string): Promise<boolean> => {
	const url = `https://www.youtube.com/watch?v=${youtubeId}`;

	const responseHtml = await (await fetch(url)).text();

	const jsonText = findYtInitialData(responseHtml);

	if (!jsonText) {
		return false;
	}

	const json = JSON.parse(jsonText) as unknown;

	if (typeof json !== 'object') {
		return false;
	}

	const {contents} = json as {contents: unknown};

	if (typeof contents !== 'object') {
		return false;
	}

	const {twoColumnWatchNextResults} = contents as {twoColumnWatchNextResults: unknown};

	if (typeof twoColumnWatchNextResults !== 'object') {
		return false;
	}

	const {secondaryResults} = twoColumnWatchNextResults as {secondaryResults: unknown};

	if (typeof secondaryResults !== 'object') {
		return false;
	}

	const {secondaryResults: inception} = secondaryResults as {secondaryResults: unknown};

	if (typeof inception !== 'object') {
		return false;
	}

	const {results} = inception as {results: unknown};

	return Array.isArray(results) && results.length > 0;
};

const ensureString = (value: unknown, defaultValue?: string): string => {
	if (typeof value !== 'string') {
		if (defaultValue !== undefined) {
			return defaultValue;
		}

		throw new Error('Expected a string');
	}

	return value;
};

const ensureNumber = (value: unknown): number => {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		throw new Error('Expected a number');
	}

	return value;
};

const createPersistYouTubeMetas = (dataSource: DataSource, log: LogFunction) =>
	async (metaDataItems: VideoMetadata[]): Promise<InsertResult> =>
		dataSource.transaction(async manager => {
			const res = await manager
				.createQueryBuilder()
				.insert()
				.into(VideoMetadata)
				.values(metaDataItems)
				.orUpdate(['view_count', 'like_count', 'comment_count', 'updated_at'], ['youtube_id'])
				.execute();

			await manager.getRepository(Video)
				.createQueryBuilder()
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
		});

export type YtApi = {
	hasDataSource(): boolean;
	getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl?: string): Promise<YouTubeVideoMetaResponse>;
	getCategoriesFromRegionCode(regionCode: string, hl?: string): Promise<VideoCategory[]>;
	cleanCache(): void;
};

export const makeCreateYouTubeApi = (cache: 'with-cache' | 'without-cache' = 'with-cache') => {
	const useCache = cache === 'with-cache';

	const metaCache = useCache
		? new MemoryCache<string, VideoMetadata>()
		: undefined;

	const categoriesCache = new Map<string, string>();

	const getCacheMemSizeBytes = (): number => metaCache
		? metaCache
			.keys()
			.reduce((acc, key) => sizeof(metaCache.get(key)) + acc, 0)
		: 0;

	const cacheForMs = () => 1000 * 60 * 5; // 5 minutes

	return async (config: YouTubeConfig, log: LogFunction, dataSource?: DataSource) => {
		google.options({
			auth: config.apiKey,
		});

		const youTube = google.youtube('v3');

		const latencyRepo = dataSource?.getRepository(YouTubeRequestLatency);
		const metaRepo = dataSource?.getRepository(VideoMetadata);
		const categoryRepo = dataSource?.getRepository(VideoCategory);
		const persistMetas = dataSource
			? createPersistYouTubeMetas(dataSource, log)
			: undefined;

		/* DISABLED UNUSED
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
		*/

		const cleanId = (id: string): string => {
			const [res] = id.split('&');
			return res;
		};

		const api: YtApi = {
			hasDataSource(): boolean {
				return Boolean(dataSource);
			},
			async getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[], hl = 'en'): Promise<YouTubeVideoMetaResponse> {
				const data: VideoMetaMap = new Map();
				const stats: Stats = {
					videoCount: 0,
					requestTime: 0,
					cacheHitRate: 0,
					dbHitRate: 0,
					hitRate: 0,
					failRate: 0,
					cacheMemSizeBytes: 0,
					cacheSizeHumanReadable: '',
					cachedEntries: 0,
				};

				const uniqueCleanedIds = [...new Set(youTubeVideoIdsMaybeNonUnique.map(cleanId))];

				stats.videoCount = uniqueCleanedIds.length;

				const idsInCache = uniqueCleanedIds.filter(id => Boolean(metaCache?.get(id)));

				stats.cacheHitRate = pct(idsInCache.length, uniqueCleanedIds.length);

				if (metaCache) {
					for (const id of idsInCache) {
						const meta = metaCache.get(id);

						if (!meta) {
							throw new Error('Expected meta to be defined');
						}

						data.set(id, meta);
					}
				}

				const idsNotInCache = uniqueCleanedIds.filter(id => !data.has(id));

				const resultsFromDb = (await metaRepo?.find({
					where: {youtubeId: In(idsNotInCache)},
				})) ?? [];

				for (const meta of resultsFromDb) {
					data.set(meta.youtubeId, meta);
				}

				stats.dbHitRate = pct(resultsFromDb.length, uniqueCleanedIds.length);

				const idsToFetchFromApi = idsNotInCache.filter(id => !data.has(id));

				const makeOutput = () => {
					stats.failRate = pct(uniqueCleanedIds.length - data.size, uniqueCleanedIds.length);
					stats.hitRate = pct(data.size, uniqueCleanedIds.length);
					stats.cacheMemSizeBytes = getCacheMemSizeBytes();
					stats.cacheSizeHumanReadable = formatSize(stats.cacheMemSizeBytes);
					stats.cachedEntries = metaCache?.keys().length ?? 0;

					log('info', 'YouTube API call stats:', stats);

					return {
						stats,
						data,
					};
				};

				if (idsToFetchFromApi.length === 0) {
					return makeOutput();
				}

				if (idsToFetchFromApi.length > 50) {
					const head = idsToFetchFromApi.slice(0, 50);
					const tail = idsToFetchFromApi.slice(50);

					const [headResult, tailResult] = await Promise.all([
						api.getMetaFromVideoIds(head, hl),
						api.getMetaFromVideoIds(tail, hl),
					]);

					return mergeResponses(headResult, tailResult);
				}

				const start = Date.now();
				const meta = await youTube.videos.list({
					part: ['topicDetails', 'snippet', 'statistics'],
					id: idsToFetchFromApi,
					hl,
				});
				const end = Date.now();

				if (latencyRepo) {
					const latency = new YouTubeRequestLatency();
					latency.latencyMs = end - start;
					latency.request = `ids: ${uniqueCleanedIds.join(',')}`;
					void latencyRepo.save(latency).catch(err => {
						log('warning', 'could not save yt request latency', err);
					});
					stats.requestTime = latency.latencyMs;
				}

				const vmdToStore: VideoMetadata[] = [];

				for (const item of meta.data.items ?? []) {
					const vmd = new VideoMetadata();
					vmd.youtubeId = ensureString(item.id);
					vmd.youtubeCategoryId = ensureString(item.snippet?.categoryId);
					vmd.categoryTitle = ensureString(categoriesCache.get(vmd.youtubeCategoryId));
					vmd.youtubeChannelId = ensureString(item.snippet?.channelId);
					vmd.videoTitle = ensureString(item.snippet?.title);
					vmd.videoDescription = ensureString(item.snippet?.description);
					vmd.publishedAt = new Date(ensureString(item.snippet?.publishedAt));
					vmd.viewCount = ensureNumber(Number(ensureString(item.statistics?.viewCount, '0')));
					vmd.likeCount = ensureNumber(Number(ensureString(item.statistics?.likeCount, '0')));
					vmd.commentCount = ensureNumber(Number(ensureString(item.statistics?.commentCount, '0')));
					vmd.tags = item.snippet?.tags ?? [];
					vmd.topicCategories = item.topicDetails?.topicCategories ?? [];

					vmdToStore.push(vmd);

					if (metaCache) {
						metaCache.put(vmd.youtubeId, vmd, cacheForMs());
					}

					data.set(vmd.youtubeId, vmd);
				}

				if (persistMetas) {
					await persistMetas(vmdToStore);
				}

				return makeOutput();
			},

			async getCategoriesFromRegionCode(regionCode: string, hl = 'en'): Promise<VideoCategory[]> {
				const categories = await youTube.videoCategories.list({
					part: ['snippet'],
					regionCode,
					hl,
				});

				const {items} = categories.data;

				if (!Array.isArray(items) || items.length === 0) {
					log('error', 'Failed to get categories from the YouTube API');
					return [];
				}

				return items.map(item => {
					const {snippet} = item;

					const category = new VideoCategory();

					category.youtubeId = ensureString(item.id);
					category.title = ensureString(snippet?.title);

					return category;
				});
			},

			async cleanCache() {
				if (metaCache) {
					metaCache.clear();
				}
			},
		};

		const warmUpCategoriesCache = async () => {
			const categories = categoryRepo
				? await categoryRepo.find()
				: [];

			if (categories.length === 0) {
				const cats = await api.getCategoriesFromRegionCode('US', 'en');
				if (categoryRepo) {
					const savedCategories = await categoryRepo.save(cats);
					categories.push(...savedCategories);
				} else {
					categories.push(...cats);
				}
			}

			for (const category of categories) {
				categoriesCache.set(category.youtubeId, category.title);
			}
		};

		await warmUpCategoriesCache();

		return api;
	};
};

export default makeCreateYouTubeApi;

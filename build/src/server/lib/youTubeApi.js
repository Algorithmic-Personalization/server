"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreateYouTubeApi = exports.isVideoAvailable = void 0;
const googleapis_1 = require("googleapis");
const node_fetch_1 = __importDefault(require("node-fetch"));
const typeorm_1 = require("typeorm");
const memory_cache_1 = require("memory-cache");
const object_sizeof_1 = __importDefault(require("object-sizeof"));
const videoCategory_1 = __importDefault(require("../models/videoCategory"));
const videoMetadata_1 = __importDefault(require("../models/videoMetadata"));
const video_1 = __importDefault(require("../models/video"));
const youTubeRequestLatency_1 = __importDefault(require("../models/youTubeRequestLatency"));
const util_1 = require("../../util");
const cleanVideoIds_1 = require("./cleanVideoIds");
const mergeStats = (a, b) => {
    const res = {
        videoCount: a.videoCount + b.videoCount,
        requestTime: a.requestTime + b.requestTime,
        cacheHitRate: ((a.cacheHitRate * a.videoCount) + (b.cacheHitRate * b.videoCount)) / (a.videoCount + b.videoCount),
        dbHitRate: ((a.dbHitRate * a.videoCount) + (b.dbHitRate * b.videoCount)) / (a.videoCount + b.videoCount),
        hitRate: ((a.hitRate * a.videoCount) + (b.hitRate * b.videoCount)) / (a.videoCount + b.videoCount),
        failRate: ((a.failRate * a.videoCount) + (b.failRate * b.videoCount)) / (a.videoCount + b.videoCount),
        cacheMemSizeBytes: b.cacheMemSizeBytes,
        cacheSizeHumanReadable: (0, util_1.formatSize)(b.cacheMemSizeBytes),
        cachedEntries: b.cachedEntries,
    };
    return res;
};
const mergeData = (a, b) => new Map([
    ...a,
    ...b,
]);
const mergeResponses = (a, b) => {
    const stats = mergeStats(a.stats, b.stats);
    const data = mergeData(a.data, b.data);
    return {
        stats,
        data,
    };
};
const findYtInitialData = (html) => {
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
const isVideoAvailable = (youtubeId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    const responseHtml = yield (yield (0, node_fetch_1.default)(url)).text();
    const jsonText = findYtInitialData(responseHtml);
    if (!jsonText) {
        return false;
    }
    const json = JSON.parse(jsonText);
    if (typeof json !== 'object') {
        return false;
    }
    const { contents } = json;
    if (typeof contents !== 'object') {
        return false;
    }
    const { twoColumnWatchNextResults } = contents;
    if (typeof twoColumnWatchNextResults !== 'object') {
        return false;
    }
    const { secondaryResults } = twoColumnWatchNextResults;
    if (typeof secondaryResults !== 'object') {
        return false;
    }
    const { secondaryResults: inception } = secondaryResults;
    if (typeof inception !== 'object') {
        return false;
    }
    const { results } = inception;
    return Array.isArray(results) && results.length > 0;
});
exports.isVideoAvailable = isVideoAvailable;
const ensureString = (value, defaultValue) => {
    if (typeof value !== 'string') {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new Error('Expected a string');
    }
    return value;
};
const ensureNumber = (value) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error('Expected a number');
    }
    return value;
};
const createPersistYouTubeMetas = (dataSource, log) => (metaDataItems) => __awaiter(void 0, void 0, void 0, function* () {
    return dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield manager
            .createQueryBuilder()
            .insert()
            .into(videoMetadata_1.default)
            .values(metaDataItems)
            .orUpdate(['view_count', 'like_count', 'comment_count', 'updated_at'], ['youtube_id'])
            .execute();
        yield manager.getRepository(video_1.default)
            .createQueryBuilder()
            .update()
            .set({
            updatedAt: new Date(),
            metadataAvailable: true,
        })
            .where({
            youtubeId: (0, typeorm_1.In)(metaDataItems.map(m => m.youtubeId)),
        })
            .execute().then(() => {
            log('successfully', 'marked', metaDataItems.length, 'videos as having metadata');
        }, () => {
            log('failed', 'to mark', metaDataItems.length, 'videos as having metadata');
        });
        return res;
    }));
});
const makeCreateYouTubeApi = (cache = 'with-cache') => {
    const useCache = cache === 'with-cache';
    const metaCache = useCache
        ? new memory_cache_1.Cache()
        : undefined;
    const categoriesCache = new Map();
    const getCacheMemSizeBytes = () => metaCache
        ? metaCache
            .keys()
            .reduce((acc, key) => (0, object_sizeof_1.default)(metaCache.get(key)) + acc, 0)
        : 0;
    const cacheForMs = () => 1000 * 60 * 5; // 5 minutes
    return (config, log, dataSource) => __awaiter(void 0, void 0, void 0, function* () {
        googleapis_1.google.options({
            auth: config.apiKey,
        });
        const youTube = googleapis_1.google.youtube('v3');
        const latencyRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(youTubeRequestLatency_1.default);
        const metaRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(videoMetadata_1.default);
        const categoryRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(videoCategory_1.default);
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
        const api = {
            hasDataSource() {
                return Boolean(dataSource);
            },
            getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique, hl = 'en') {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                return __awaiter(this, void 0, void 0, function* () {
                    const data = new Map();
                    const stats = {
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
                    const uniqueCleanedIds = [...new Set(youTubeVideoIdsMaybeNonUnique.map(cleanVideoIds_1.cleanId))];
                    stats.videoCount = uniqueCleanedIds.length;
                    const idsInCache = uniqueCleanedIds.filter(id => Boolean(metaCache === null || metaCache === void 0 ? void 0 : metaCache.get(id)));
                    stats.cacheHitRate = (0, util_1.pct)(idsInCache.length, uniqueCleanedIds.length);
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
                    const resultsFromDb = (_a = (yield (metaRepo === null || metaRepo === void 0 ? void 0 : metaRepo.find({
                        where: { youtubeId: (0, typeorm_1.In)(idsNotInCache) },
                    })))) !== null && _a !== void 0 ? _a : [];
                    for (const meta of resultsFromDb) {
                        data.set(meta.youtubeId, meta);
                    }
                    stats.dbHitRate = (0, util_1.pct)(resultsFromDb.length, uniqueCleanedIds.length);
                    const idsToFetchFromApi = idsNotInCache.filter(id => !data.has(id));
                    const makeOutput = () => {
                        var _a;
                        stats.failRate = (0, util_1.pct)(uniqueCleanedIds.length - data.size, uniqueCleanedIds.length);
                        stats.hitRate = (0, util_1.pct)(data.size, uniqueCleanedIds.length);
                        stats.cacheMemSizeBytes = getCacheMemSizeBytes();
                        stats.cacheSizeHumanReadable = (0, util_1.formatSize)(stats.cacheMemSizeBytes);
                        stats.cachedEntries = (_a = metaCache === null || metaCache === void 0 ? void 0 : metaCache.keys().length) !== null && _a !== void 0 ? _a : 0;
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
                        const [headResult, tailResult] = yield Promise.all([
                            api.getMetaFromVideoIds(head, hl),
                            api.getMetaFromVideoIds(tail, hl),
                        ]);
                        return mergeResponses(headResult, tailResult);
                    }
                    const start = Date.now();
                    const meta = yield youTube.videos.list({
                        part: ['topicDetails', 'snippet', 'statistics'],
                        id: idsToFetchFromApi,
                        hl,
                    });
                    const end = Date.now();
                    if (latencyRepo) {
                        const latency = new youTubeRequestLatency_1.default();
                        latency.latencyMs = end - start;
                        latency.request = `ids: ${uniqueCleanedIds.join(',')}`;
                        void latencyRepo.save(latency).catch(err => {
                            log('warning', 'could not save yt request latency', err);
                        });
                        stats.requestTime = latency.latencyMs;
                    }
                    const vmdToStore = [];
                    for (const item of (_b = meta.data.items) !== null && _b !== void 0 ? _b : []) {
                        const vmd = new videoMetadata_1.default();
                        vmd.youtubeId = ensureString(item.id);
                        vmd.youtubeCategoryId = ensureString((_c = item.snippet) === null || _c === void 0 ? void 0 : _c.categoryId);
                        vmd.categoryTitle = ensureString(categoriesCache.get(vmd.youtubeCategoryId));
                        vmd.youtubeChannelId = ensureString((_d = item.snippet) === null || _d === void 0 ? void 0 : _d.channelId);
                        vmd.videoTitle = ensureString((_e = item.snippet) === null || _e === void 0 ? void 0 : _e.title);
                        vmd.videoDescription = ensureString((_f = item.snippet) === null || _f === void 0 ? void 0 : _f.description);
                        vmd.publishedAt = new Date(ensureString((_g = item.snippet) === null || _g === void 0 ? void 0 : _g.publishedAt));
                        vmd.viewCount = ensureNumber(Number(ensureString((_h = item.statistics) === null || _h === void 0 ? void 0 : _h.viewCount, '0')));
                        vmd.likeCount = ensureNumber(Number(ensureString((_j = item.statistics) === null || _j === void 0 ? void 0 : _j.likeCount, '0')));
                        vmd.commentCount = ensureNumber(Number(ensureString((_k = item.statistics) === null || _k === void 0 ? void 0 : _k.commentCount, '0')));
                        vmd.tags = (_m = (_l = item.snippet) === null || _l === void 0 ? void 0 : _l.tags) !== null && _m !== void 0 ? _m : [];
                        vmd.topicCategories = (_p = (_o = item.topicDetails) === null || _o === void 0 ? void 0 : _o.topicCategories) !== null && _p !== void 0 ? _p : [];
                        vmdToStore.push(vmd);
                        if (metaCache) {
                            metaCache.put(vmd.youtubeId, vmd, cacheForMs());
                        }
                        data.set(vmd.youtubeId, vmd);
                    }
                    if (dataSource && persistMetas) {
                        yield persistMetas(vmdToStore);
                        const missingMeta = idsToFetchFromApi.filter(id => !data.has(id));
                        missingMeta.map((youtubeId) => __awaiter(this, void 0, void 0, function* () {
                            const available = yield (0, exports.isVideoAvailable)(youtubeId);
                            if (!available) {
                                log('info', 'video', youtubeId, 'is not available');
                                dataSource
                                    .createQueryBuilder()
                                    .update(video_1.default)
                                    .set({
                                    metadataAvailable: false,
                                })
                                    .where({
                                    youtubeId,
                                })
                                    .execute()
                                    .then(() => {
                                    log('info', 'marked video', youtubeId, 'as unavailable');
                                }, () => {
                                    log('error', 'failed to mark video', youtubeId, 'as unavailable');
                                });
                            }
                        }));
                    }
                    return makeOutput();
                });
            },
            getCategoriesFromRegionCode(regionCode, hl = 'en') {
                return __awaiter(this, void 0, void 0, function* () {
                    const categories = yield youTube.videoCategories.list({
                        part: ['snippet'],
                        regionCode,
                        hl,
                    });
                    const { items } = categories.data;
                    if (!Array.isArray(items) || items.length === 0) {
                        log('error', 'Failed to get categories from the YouTube API');
                        return [];
                    }
                    return items.map(item => {
                        const { snippet } = item;
                        const category = new videoCategory_1.default();
                        category.youtubeId = ensureString(item.id);
                        category.title = ensureString(snippet === null || snippet === void 0 ? void 0 : snippet.title);
                        return category;
                    });
                });
            },
            cleanCache() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (metaCache) {
                        metaCache.clear();
                    }
                });
            },
        };
        const warmUpCategoriesCache = () => __awaiter(void 0, void 0, void 0, function* () {
            const categories = categoryRepo
                ? yield categoryRepo.find()
                : [];
            if (categories.length === 0) {
                const cats = yield api.getCategoriesFromRegionCode('US', 'en');
                if (categoryRepo) {
                    const savedCategories = yield categoryRepo.save(cats);
                    categories.push(...savedCategories);
                }
                else {
                    categories.push(...cats);
                }
            }
            for (const category of categories) {
                categoriesCache.set(category.youtubeId, category.title);
            }
        });
        yield warmUpCategoriesCache();
        return api;
    });
};
exports.makeCreateYouTubeApi = makeCreateYouTubeApi;
exports.default = exports.makeCreateYouTubeApi;
//# sourceMappingURL=youTubeApi.js.map
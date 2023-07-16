"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.makeCreateYouTubeApi = exports.isVideoAvailable = exports.CategoryListItem = exports.VideoListItem = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const memory_cache_1 = require("memory-cache");
const object_sizeof_1 = __importDefault(require("object-sizeof"));
const videoCategory_1 = __importDefault(require("../models/videoCategory"));
const videoMetadata_1 = __importDefault(require("../models/videoMetadata"));
const video_1 = __importDefault(require("../models/video"));
const youTubeRequestLatency_1 = __importDefault(require("../models/youTubeRequestLatency"));
const util_1 = require("../../util");
const util_2 = require("./../../common/util");
const mergeInto = (target) => (source) => {
    for (const [key, value] of source) {
        target.set(key, value);
    }
};
class PageInfo {
    constructor() {
        this.totalResults = 0;
        this.resultsPerPage = 0;
    }
}
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], PageInfo.prototype, "totalResults", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], PageInfo.prototype, "resultsPerPage", void 0);
class YouTubeResponse {
    constructor() {
        this.kind = '';
        this.etag = '';
        this.items = [];
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], YouTubeResponse.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], YouTubeResponse.prototype, "etag", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", PageInfo)
], YouTubeResponse.prototype, "pageInfo", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], YouTubeResponse.prototype, "items", void 0);
class TopicDetails {
    constructor() {
        this.topicCategories = [];
    }
}
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], TopicDetails.prototype, "topicCategories", void 0);
class VideoSnippet {
    constructor() {
        this.channelId = '';
        this.categoryId = '';
        this.publishedAt = '';
        this.title = '';
        this.description = '';
        this.tags = [];
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "channelId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "publishedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VideoSnippet.prototype, "tags", void 0);
class VideoStatistics {
    constructor() {
        this.viewCount = '0';
        this.likeCount = '0';
        this.commentCount = '0';
    }
}
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], VideoStatistics.prototype, "viewCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], VideoStatistics.prototype, "likeCount", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], VideoStatistics.prototype, "commentCount", void 0);
class VideoListItem {
    constructor() {
        this.kind = '';
        this.etag = '';
        this.id = '';
        this.snippet = new VideoSnippet();
        this.statistics = new VideoStatistics();
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "etag", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", TopicDetails)
], VideoListItem.prototype, "topicDetails", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "snippet", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "statistics", void 0);
exports.VideoListItem = VideoListItem;
class YouTubeVideoListResponse extends YouTubeResponse {
}
class CategorySnippet {
    constructor() {
        this.title = '';
        this.assignable = false;
        this.channelId = '';
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CategorySnippet.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], CategorySnippet.prototype, "assignable", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CategorySnippet.prototype, "channelId", void 0);
class CategoryListItem {
    constructor() {
        this.kind = '';
        this.etag = '';
        this.id = '';
        this.snippet = new CategorySnippet();
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "etag", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "snippet", void 0);
exports.CategoryListItem = CategoryListItem;
class YouTubeCategoryListResponse extends YouTubeResponse {
}
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
// TODO: non working
const isVideoAvailable = (youtubeId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    const responseHtml = yield (yield (0, node_fetch_1.default)(url)).text();
    const jsonText = findYtInitialData(responseHtml);
    if (!jsonText) {
        return false;
    }
    const json = JSON.parse(jsonText);
    if (typeof json !== 'object') {
        throw new Error('json is not an object');
    }
    const { contents } = json;
    if (typeof contents !== 'object') {
        throw new Error('content is not an object');
    }
    const { twoColumnWatchNextResults } = contents;
    if (typeof twoColumnWatchNextResults !== 'object') {
        throw new Error('twoColumnWatchNextResults is not an object');
    }
    const { secondaryResults } = twoColumnWatchNextResults;
    if (typeof secondaryResults !== 'object') {
        return false;
    }
    const { secondaryResults: inception } = secondaryResults;
    if (typeof inception !== 'object') {
        throw new Error('inception is not an object');
    }
    const { results } = inception;
    return Array.isArray(results) && results.length > 0;
});
exports.isVideoAvailable = isVideoAvailable;
const getManyYoutubeMetas = (repo) => (youtubeIds) => __awaiter(void 0, void 0, void 0, function* () {
    const items = yield repo.find({
        where: { youtubeId: (0, typeorm_1.In)(youtubeIds) },
    });
    return new Map(items.map(m => [m.youtubeId, m]));
});
const createPersistYouTubeMetas = (dataSource, log) => (metaDataItems) => __awaiter(void 0, void 0, void 0, function* () {
    const res = (0, util_1.showInsertSql)(log)(dataSource.createQueryBuilder()
        .insert()
        .into(videoMetadata_1.default)
        .values(metaDataItems)
        .orUpdate(['view_count', 'like_count', 'comment_count', 'updated_at'], ['youtube_id'])).execute();
    const videoRepo = dataSource.getRepository(video_1.default);
    videoRepo.createQueryBuilder()
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
});
const intIfDefined = (str) => {
    if (!str) {
        return 0;
    }
    const res = parseInt(str, 10);
    if (isNaN(res)) {
        throw new Error('invalid number: ' + str);
    }
    return res;
};
const makeCreateYouTubeApi = (cache = 'with-cache') => {
    const useCache = cache === 'with-cache';
    const metaCache = new memory_cache_1.Cache();
    const categoriesCache = new Map();
    const fetchingMeta = new Map();
    let fetchingCategories;
    let totalCacheHitRate = 0;
    let numberOfCalls = 0;
    const getCacheMemSizeBytes = () => metaCache
        .keys()
        .reduce((acc, key) => (0, object_sizeof_1.default)(metaCache.get(key)) + acc, 0);
    // TODO: cache items for less time if memory is low
    const cacheForMs = () => 1000 * 60 * 5; // 5 minutes
    return (config, log, dataSource) => {
        const latencyRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(youTubeRequestLatency_1.default);
        const metaRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(videoMetadata_1.default);
        const categoryRepo = dataSource === null || dataSource === void 0 ? void 0 : dataSource.getRepository(videoCategory_1.default);
        const persistMetas = dataSource
            ? createPersistYouTubeMetas(dataSource, log)
            : undefined;
        const endpoint = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet&part=statistics`;
        const persistNonAvailable = (youtubeIds) => __awaiter(void 0, void 0, void 0, function* () {
            if (!dataSource || youtubeIds.length === 0) {
                return;
            }
            const videoRepo = dataSource.getRepository(video_1.default);
            return videoRepo.update({
                youtubeId: (0, typeorm_1.In)(youtubeIds),
            }, {
                metadataAvailable: false,
            });
        });
        const getUrlAndStoreLatency = (url) => __awaiter(void 0, void 0, void 0, function* () {
            const tStart = Date.now();
            const res = (0, node_fetch_1.default)(url, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            });
            if (latencyRepo) {
                res.then(() => {
                    const tElapsed = Date.now() - tStart;
                    const latency = new youTubeRequestLatency_1.default();
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
        });
        const api = {
            hasDataSource() {
                return Boolean(dataSource);
            },
            // TODO: split into multiple queries if the list of unique IDs is too long (> 50)
            // eslint-disable-next-line complexity
            getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique, hl = 'en', recurse = true) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield fetchingCategories;
                    const youTubeIds = [...new Set(youTubeVideoIdsMaybeNonUnique)];
                    const tStart = Date.now();
                    const metaMap = new Map();
                    const promisesToWaitFor = new Set();
                    const idsNotCached = [];
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
                        ? yield getManyYoutubeMetas(metaRepo)(idsNotCached)
                        : undefined;
                    if (idsNotCached.length > 0 && dbMap) {
                        log('info', 'just showing one video as retrieved from the db for debugging purposes:', dbMap.get(idsNotCached[0]));
                    }
                    const finalIdsToGetFromYouTube = [];
                    for (const id of idsNotCached) {
                        const dbCached = dbMap === null || dbMap === void 0 ? void 0 : dbMap.get(id);
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
                    const responses = yield Promise.allSettled(promisesToWaitFor);
                    const arrayResponses = [];
                    for (const response of responses) {
                        if (response.status === 'rejected') {
                            log('error getting some meta-data for videos:', response.reason);
                        }
                        else {
                            arrayResponses.push(response.value);
                        }
                    }
                    const rawResponses = (yield Promise.all(arrayResponses.map((r) => __awaiter(this, void 0, void 0, function* () {
                        return r.json().catch(err => {
                            log('error', 'Failed to parse YouTube response', err);
                            return undefined;
                        });
                    })))).filter(r => r);
                    const validationPromises = [];
                    const youTubeResponses = [];
                    for (const raw of rawResponses) {
                        const youTubeResponse = new YouTubeVideoListResponse();
                        Object.assign(youTubeResponse, raw);
                        validationPromises.push((0, class_validator_1.validate)(youTubeResponse, {
                            skipMissingProperties: false,
                            forbidUnknownValues: false,
                        }));
                        youTubeResponses.push(youTubeResponse);
                    }
                    const validation = yield Promise.allSettled(validationPromises);
                    const metaToValidate = [];
                    const itemsFromYouTube = [];
                    const metaValidationPromises = [];
                    validation.forEach((validationResult, i) => {
                        var _a, _b, _c, _d;
                        if (validationResult.status === 'rejected') {
                            log('error validating the response from the YouTube API:', validationResult.reason, 'response from YouTube was:', youTubeResponses[i]);
                        }
                        else {
                            const errors = validationResult.value;
                            if (errors.length === 0) {
                                const { items } = youTubeResponses[i];
                                log('debug', 'YouTube response page info:', youTubeResponses[i].pageInfo);
                                if (!items || items.length === 0) {
                                    log('error', 'YouTube response did not contain items, API quota probably exceeded', youTubeResponses[i]);
                                }
                                for (const item of items) {
                                    itemsFromYouTube.push(item);
                                    const meta = new videoMetadata_1.default();
                                    meta.youtubeId = item.id;
                                    meta.youtubeCategoryId = item.snippet.categoryId;
                                    meta.categoryTitle = (_a = categoriesCache.get(item.snippet.categoryId)) !== null && _a !== void 0 ? _a : '<unknown>';
                                    meta.topicCategories = (_c = (_b = item.topicDetails) === null || _b === void 0 ? void 0 : _b.topicCategories) !== null && _c !== void 0 ? _c : [];
                                    meta.tags = (_d = item.snippet.tags) !== null && _d !== void 0 ? _d : [];
                                    meta.videoTitle = item.snippet.title;
                                    meta.videoDescription = item.snippet.description;
                                    meta.publishedAt = new Date(item.snippet.publishedAt);
                                    meta.youtubeChannelId = item.snippet.channelId;
                                    meta.viewCount = intIfDefined(item.statistics.viewCount);
                                    meta.likeCount = intIfDefined(item.statistics.likeCount);
                                    meta.commentCount = intIfDefined(item.statistics.commentCount);
                                    metaToValidate.push(meta);
                                    metaValidationPromises.push((0, util_2.validateNew)(meta));
                                }
                            }
                            else {
                                log('errors validating some meta-data for videos:', errors);
                            }
                        }
                    });
                    const metaToPersist = [];
                    const metaValidations = yield Promise.allSettled(metaValidationPromises);
                    metaValidations.forEach((validationResult, i) => {
                        if (validationResult.status === 'rejected') {
                            log('error running the validation on video metadata:', validationResult.reason);
                        }
                        else {
                            const errors = validationResult.value;
                            const meta = metaToValidate[i];
                            if (errors.length === 0) {
                                metaToPersist.push(meta);
                                metaMap.set(meta.youtubeId, meta);
                                if (useCache) {
                                    metaCache.put(meta.youtubeId, meta, cacheForMs());
                                }
                            }
                            else {
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
                    const failRate = (0, util_1.pct)(failedIds.length, youTubeIds.length);
                    const hitRate = (0, util_1.pct)(cacheHits + dbHits, youTubeIds.length);
                    const dbHitRate = (0, util_1.pct)(dbHits, youTubeIds.length);
                    const cacheHitRate = (0, util_1.pct)(cacheHits, youTubeIds.length);
                    const requestTimeMs = Date.now() - tStart;
                    totalCacheHitRate += cacheHitRate;
                    ++numberOfCalls;
                    const cacheMemSizeBytes = getCacheMemSizeBytes();
                    if (metaMap.size !== youTubeIds.length) {
                        const message = `got meta-data back only for ${metaMap.size} of ${youTubeIds.length} videos`;
                        const missing = [];
                        for (const id of youTubeIds) {
                            if (!metaMap.has(id)) {
                                missing.push(id);
                            }
                        }
                        log('warning', message, 'the missing ids are:', missing);
                        log('debug', 'trying to fetch the missing meta again');
                        if (recurse) {
                            const meta = yield this.getMetaFromVideoIds(missing, hl, false);
                            mergeInto(metaMap)(meta.data);
                            refetched = meta.data.size;
                        }
                    }
                    if (metaMap.size !== youTubeIds.length && (!recurse)) {
                        const stillMissing = youTubeIds.filter(id => !metaMap.has(id));
                        const available = yield Promise.all(stillMissing.map(exports.isVideoAvailable));
                        const res = yield persistNonAvailable(stillMissing.filter((_, i) => !available[i]));
                        log('info', 'persisted non-available videos', res);
                    }
                    const stats = {
                        metadataRequestTimeMs: requestTimeMs,
                        failRate,
                        dbHitRate,
                        cacheHitRate,
                        cacheMemSizeBytes,
                        cacheMemSizeString: (0, util_1.formatSize)(cacheMemSizeBytes),
                        cachedEntries: metaCache.size(),
                        hitRate,
                        overAllCacheHitRate: (0, util_1.formatPct)(totalCacheHitRate / numberOfCalls),
                        refetched,
                    };
                    log('info', 'meta data gotten from yt, stats:', stats);
                    return Object.assign(Object.assign({}, stats), { data: metaMap });
                });
            },
            getCategoriesFromRegionCode(regionCode, hl = 'en') {
                return __awaiter(this, void 0, void 0, function* () {
                    const url = `${config.categoriesEndPoint}/?key=${config.apiKey}&part=snippet&regionCode=${regionCode}&hl=${hl}`;
                    const response = yield getUrlAndStoreLatency(url);
                    const raw = yield response.json();
                    const youTubeResponse = new YouTubeCategoryListResponse();
                    Object.assign(youTubeResponse, raw);
                    const errors = yield (0, class_validator_1.validate)(youTubeResponse);
                    if (errors.length > 0) {
                        throw new Error(`error validating YouTube category list response: ${errors.join(', ')}`);
                    }
                    return youTubeResponse.items;
                });
            },
        };
        (() => __awaiter(void 0, void 0, void 0, function* () {
            if (categoriesCache.size > 0) {
                return;
            }
            if (dataSource) {
                const categoriesRepo = dataSource.getRepository(videoCategory_1.default);
                const promise = categoriesRepo.find();
                fetchingCategories = promise;
                const categories = yield promise;
                for (const category of categories) {
                    categoriesCache.set(category.youtubeId, category.title);
                }
                if (categoriesCache.size > 0) {
                    return;
                }
            }
            const promise = api.getCategoriesFromRegionCode('US');
            fetchingCategories = promise;
            const categories = yield promise;
            for (const category of categories) {
                categoriesCache.set(category.id, category.snippet.title);
            }
            if (categoryRepo) {
                for (const category of categories) {
                    const videoCategory = new videoCategory_1.default();
                    videoCategory.youtubeId = category.id;
                    videoCategory.title = category.snippet.title;
                    categoryRepo.save(videoCategory).catch(err => {
                        log('error', 'Failed to save YouTube category', err);
                    });
                }
            }
        }))();
        return api;
    };
};
exports.makeCreateYouTubeApi = makeCreateYouTubeApi;
exports.default = exports.makeCreateYouTubeApi;
//# sourceMappingURL=youTubeApi.js.map
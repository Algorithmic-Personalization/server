"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.makeCreateYouTubeApi = exports.CategoryListItem = exports.VideoListItem = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const class_validator_1 = require("class-validator");
const memory_cache_1 = require("memory-cache");
const object_sizeof_1 = __importDefault(require("object-sizeof"));
const videoCategory_1 = __importDefault(require("../models/videoCategory"));
const videoMetadata_1 = __importStar(require("../models/videoMetadata"));
const youTubeRequestLatency_1 = __importDefault(require("../models/youTubeRequestLatency"));
const util_1 = require("../../util");
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
        this.tags = [];
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "channelId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoSnippet.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VideoSnippet.prototype, "tags", void 0);
class VideoListItem {
    constructor() {
        this.kind = '';
        this.etag = '';
        this.id = '';
        this.snippet = new VideoSnippet();
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], VideoListItem.prototype, "etag", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
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
    __metadata("design:type", Object)
], CategoryListItem.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "etag", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", Object)
], CategoryListItem.prototype, "snippet", void 0);
exports.CategoryListItem = CategoryListItem;
class YouTubeCategoryListResponse extends YouTubeResponse {
}
const getYouTubeMeta = (repo) => (youtubeId) => __awaiter(void 0, void 0, void 0, function* () {
    const metaRows = yield repo.find({ where: { youtubeId } });
    if (metaRows.length === 0) {
        return undefined;
    }
    const meta = {
        videoId: youtubeId,
        categoryId: '',
        categoryTitle: '',
        topicCategories: [],
        tags: [],
    };
    for (const row of metaRows) {
        switch (row.type) {
            case videoMetadata_1.MetadataType.TAG:
                meta.tags.push(row.value);
                break;
            case videoMetadata_1.MetadataType.TOPIC_CATEGORY:
                meta.topicCategories.push(row.value);
                break;
            case videoMetadata_1.MetadataType.YT_CATEGORY_ID:
                meta.categoryId = row.value;
                break;
            case videoMetadata_1.MetadataType.YT_CATEGORY_TITLE:
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
});
const getManyYoutubeMetas = (repo) => (videoIds) => __awaiter(void 0, void 0, void 0, function* () {
    const getOne = getYouTubeMeta(repo);
    const res = new Map();
    const metas = yield Promise.all(videoIds.map(getOne));
    for (const meta of metas) {
        if (meta === undefined) {
            continue;
        }
        res.set(meta.videoId, meta);
    }
    return res;
});
const convertToVideoMetaData = (meta) => {
    const res = [];
    const categoryIdMeta = new videoMetadata_1.default();
    categoryIdMeta.youtubeId = meta.videoId;
    categoryIdMeta.type = videoMetadata_1.MetadataType.YT_CATEGORY_ID;
    categoryIdMeta.value = meta.categoryId;
    res.push(categoryIdMeta);
    const categoryTitleMeta = new videoMetadata_1.default();
    categoryTitleMeta.youtubeId = meta.videoId;
    categoryTitleMeta.type = videoMetadata_1.MetadataType.YT_CATEGORY_TITLE;
    categoryTitleMeta.value = meta.categoryTitle;
    res.push(categoryTitleMeta);
    for (const topic of meta.topicCategories) {
        const metaData = new videoMetadata_1.default();
        metaData.youtubeId = meta.videoId;
        metaData.value = topic;
        metaData.type = videoMetadata_1.MetadataType.TOPIC_CATEGORY;
        res.push(metaData);
    }
    if (meta.tags) {
        for (const tag of meta.tags) {
            const metaData = new videoMetadata_1.default();
            metaData.youtubeId = meta.videoId;
            metaData.value = tag;
            metaData.type = videoMetadata_1.MetadataType.TAG;
            res.push(metaData);
        }
    }
    return res;
};
const mergeInto = (target) => (source) => {
    for (const [key, value] of source) {
        target.set(key, value);
    }
};
// TODO: handle update?
const createPersistYouTubeMetas = (dataSource, log) => (metaToPersistInOrder) => __awaiter(void 0, void 0, void 0, function* () {
    const qr = dataSource.createQueryRunner();
    const youtubeIds = [...new Set(metaToPersistInOrder.map(m => m.youtubeId))];
    try {
        yield qr.connect();
        yield qr.startTransaction();
        const repo = qr.manager.getRepository(videoMetadata_1.default);
        const metas = yield repo
            .createQueryBuilder('m')
            .useTransaction(true)
            .setLock('pessimistic_write')
            .where({ youtubeId: youtubeIds })
            .select('m.youtube_id')
            .getMany();
        const ignoreSet = new Set(metas.map(m => m.youtubeId));
        if (ignoreSet.size > 0) {
            log('info', ignoreSet.size, 'metas already in DB, skipping them...');
        }
        const insertList = metaToPersistInOrder.filter(m => !ignoreSet.has(m.youtubeId));
        const nVids = youtubeIds.length - ignoreSet.size;
        log('info', insertList.length, 'metas to insert in DB, corresponding to', nVids, 'videos ...');
        const res = yield repo.insert(insertList);
        const inserted = res.identifiers.length;
        yield qr.commitTransaction();
        log('info', inserted, 'metas inserted in DB or', (0, util_1.pct)(inserted, insertList.length), '%');
    }
    catch (e) {
        yield qr.rollbackTransaction();
        throw e;
    }
    finally {
        yield qr.release();
    }
});
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
        const endpoint = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet`;
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
            // TODO: split into multiple queries if the list of unique IDs is too long (> 50)
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
                    const rawResponses = yield Promise.all(arrayResponses.map((r) => __awaiter(this, void 0, void 0, function* () { return r.json(); })));
                    const validationPromises = [];
                    const youTubeResponses = [];
                    for (const raw of rawResponses) {
                        const youTubeResponse = new YouTubeVideoListResponse();
                        Object.assign(youTubeResponse, raw);
                        validationPromises.push((0, class_validator_1.validate)(youTubeResponse));
                        youTubeResponses.push(youTubeResponse);
                    }
                    const validation = yield Promise.allSettled(validationPromises);
                    const metaToPersist = [];
                    validation.forEach((validationResult, i) => {
                        var _a, _b, _c, _d;
                        if (validationResult.status === 'rejected') {
                            log('error validating some meta-data for videos:', validationResult.reason, 'response from YouTube was:', youTubeResponses[i]);
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
                                    const meta = {
                                        videoId: item.id,
                                        categoryId: item.snippet.categoryId,
                                        categoryTitle: (_a = categoriesCache.get(item.snippet.categoryId)) !== null && _a !== void 0 ? _a : '<unknown>',
                                        topicCategories: (_c = (_b = item.topicDetails) === null || _b === void 0 ? void 0 : _b.topicCategories) !== null && _c !== void 0 ? _c : [],
                                        tags: (_d = item.snippet.tags) !== null && _d !== void 0 ? _d : [],
                                    };
                                    metaToPersist.push(meta);
                                    metaMap.set(item.id, meta);
                                    if (useCache) {
                                        metaCache.put(item.id, meta, cacheForMs());
                                    }
                                }
                            }
                            else {
                                log('errors validating some meta-data for videos:', errors);
                            }
                        }
                    });
                    const metaToPersistInOrder = [];
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
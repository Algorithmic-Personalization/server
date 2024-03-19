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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.storeHomeShownVideos = exports.storeRecommendationsShown = void 0;
const video_1 = __importDefault(require("../models/video"));
const videoListItem_1 = __importStar(require("../models/videoListItem"));
const util_1 = require("../../common/util");
const storeVideos_1 = require("./video/storeVideos");
const youTubeApi_1 = __importDefault(require("./youTubeApi"));
const storeItems = (repo, eventId) => (videoIds, listType, videoTypes) => __awaiter(void 0, void 0, void 0, function* () {
    const videoListItems = [];
    for (let i = 0; i < videoIds.length; i++) {
        const item = new videoListItem_1.default();
        item.videoId = videoIds[i];
        item.listType = listType;
        item.videoType = videoTypes[i];
        item.position = i;
        item.eventId = eventId;
        videoListItems.push(item);
    }
    yield Promise.all(videoListItems.map(util_1.validateNew));
    yield repo.save(videoListItems);
});
const createYouTubeApi = (0, youTubeApi_1.default)();
const extractVideoIdFromUrl = (url) => {
    const exp = /\?v=([^&]+)/;
    const m = exp.exec(url);
    if (m) {
        return m[1];
    }
    return undefined;
};
const storeRecommendationsShown = ({ log, dataSource, event, youTubeConfig, }) => __awaiter(void 0, void 0, void 0, function* () {
    log('Storing recommendations shown event meta-data');
    const youTubeApi = yield createYouTubeApi(youTubeConfig, log, dataSource);
    const videoRepo = dataSource.getRepository(video_1.default);
    const [nonPersonalized, personalized] = yield Promise.all([
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.nonPersonalized)),
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.personalized)),
    ]);
    const urlId = extractVideoIdFromUrl(event.url);
    log('Retrieving meta-data information for videos recommended with', urlId !== null && urlId !== void 0 ? urlId : '<no url>...');
    const youTubeIds = [...new Set([
            ...event.nonPersonalized.map(v => v.videoId),
            ...event.personalized.map(v => v.videoId),
            urlId,
        ])].filter(x => x !== undefined);
    try {
        yield youTubeApi.getMetaFromVideoIds(youTubeIds).then(response => {
            log(`fetched ${response.data.size} meta-data items for ${youTubeIds.length} videos in ${response.stats.requestTime} ms.`);
        }).catch(err => {
            log('error fetching video meta-data', err);
        });
    }
    catch (err) {
        log('error fetching video meta-data', err);
    }
    const nonPersonalizedTypes = nonPersonalized.map(() => videoListItem_1.VideoType.NON_PERSONALIZED);
    const personalizedTypes = personalized.map(() => videoListItem_1.VideoType.PERSONALIZED);
    const itemRepo = dataSource.getRepository(videoListItem_1.default);
    const store = storeItems(itemRepo, event.id);
    try {
        yield Promise.all([
            store(nonPersonalized, videoListItem_1.ListType.NON_PERSONALIZED, nonPersonalizedTypes),
            store(personalized, videoListItem_1.ListType.PERSONALIZED, personalizedTypes),
        ]);
        log('Stored recommendations shown event meta-data');
    }
    catch (err) {
        log('Error storing recommendations shown event meta-data', err);
    }
});
exports.storeRecommendationsShown = storeRecommendationsShown;
const storeHomeShownVideos = ({ log, dataSource, event, youTubeConfig, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    log('Storing home shown videos');
    const itemRepo = dataSource.getRepository(videoListItem_1.default);
    const store = storeItems(itemRepo, event.id);
    const videoRepo = dataSource.getRepository(video_1.default);
    const storeVideoPromises = [
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.defaultRecommendations)),
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.replacementSource)),
    ];
    if (event.shown) {
        storeVideoPromises.push((0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.shown)));
    }
    const [defaultHome, replacement, shown] = yield Promise.all(storeVideoPromises);
    yield Promise.all([
        store(defaultHome, videoListItem_1.ListType.HOME_DEFAULT, defaultHome.map(() => videoListItem_1.VideoType.PERSONALIZED)),
        store(replacement, videoListItem_1.ListType.HOME_REPLACEMENT_SOURCE, replacement.map(() => videoListItem_1.VideoType.PERSONALIZED)),
        shown && store(shown, videoListItem_1.ListType.HOME_SHOWN, shown.map(() => videoListItem_1.VideoType.PERSONALIZED)),
    ]);
    const youTubeApi = yield createYouTubeApi(youTubeConfig, log, dataSource);
    const youTubeIds = [...new Set([
            ...event.defaultRecommendations.map(v => v.videoId),
            ...event.replacementSource.map(v => v.videoId),
            ...(_b = (_a = event.shown) === null || _a === void 0 ? void 0 : _a.map(v => v.videoId)) !== null && _b !== void 0 ? _b : [],
        ])].filter(x => x !== undefined);
    yield youTubeApi.getMetaFromVideoIds(youTubeIds).catch(err => {
        log('error', 'fetching video meta-data', err);
    });
});
exports.storeHomeShownVideos = storeHomeShownVideos;
exports.default = exports.storeRecommendationsShown;
//# sourceMappingURL=storeRecommendationsShown.js.map
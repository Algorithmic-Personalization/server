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
exports.storeRecommendationsShown = void 0;
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
const storeRecommendationsShown = ({ log, dataSource, event, youTubeConfig, }) => __awaiter(void 0, void 0, void 0, function* () {
    log('Storing recommendations shown event meta-data');
    const youTubeApi = createYouTubeApi(youTubeConfig, log, dataSource);
    const videoRepo = dataSource.getRepository(video_1.default);
    const [nonPersonalized, personalized, shown] = yield Promise.all([
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.nonPersonalized)),
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.personalized)),
        (0, storeVideos_1.storeVideos)(videoRepo, (0, storeVideos_1.makeVideosFromRecommendations)(event.shown)),
    ]);
    log('Retrieving category information for videos...');
    const youTubeIds = [...new Set([
            ...event.nonPersonalized.map(v => v.videoId),
            ...event.personalized.map(v => v.videoId),
            ...event.shown.map(v => v.videoId),
        ])];
    const now = Date.now();
    youTubeApi.getMetaFromVideoIds(youTubeIds).then(categories => {
        const elapsed = Date.now() - now;
        log(`fetched ${categories.data.size} meta-data items for ${youTubeIds.length} videos in ${elapsed} ms.`);
    }).catch(err => {
        log('error fetching video meta-data', err);
    });
    const nonPersonalizedTypes = nonPersonalized.map(() => videoListItem_1.VideoType.NON_PERSONALIZED);
    const personalizedTypes = personalized.map(() => videoListItem_1.VideoType.PERSONALIZED);
    const shownTypes = event.shown.map(r => {
        if (r.personalization === 'non-personalized') {
            return videoListItem_1.VideoType.NON_PERSONALIZED;
        }
        if (r.personalization === 'personalized') {
            return videoListItem_1.VideoType.PERSONALIZED;
        }
        if (r.personalization === 'mixed') {
            return videoListItem_1.VideoType.MIXED;
        }
        throw new Error(`Invalid personalization type: ${r.personalization}`);
    });
    const itemRepo = dataSource.getRepository(videoListItem_1.default);
    const store = storeItems(itemRepo, event.id);
    try {
        yield Promise.all([
            store(nonPersonalized, videoListItem_1.ListType.NON_PERSONALIZED, nonPersonalizedTypes),
            store(personalized, videoListItem_1.ListType.PERSONALIZED, personalizedTypes),
            store(shown, videoListItem_1.ListType.SHOWN, shownTypes),
        ]);
        log('Stored recommendations shown event meta-data');
    }
    catch (err) {
        log('Error storing recommendations shown event meta-data', err);
    }
});
exports.storeRecommendationsShown = storeRecommendationsShown;
exports.default = exports.storeRecommendationsShown;
//# sourceMappingURL=storeRecommendationsShown.js.map
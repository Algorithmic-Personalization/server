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
exports.createGetEventOverviewsRoute = void 0;
const event_1 = __importStar(require("../../common/models/event"));
const watchTime_1 = __importDefault(require("../models/watchTime"));
const videoListItem_1 = __importStar(require("../models/videoListItem"));
const video_1 = __importDefault(require("../models/video"));
const getParticipantOverview_1 = require("./getParticipantOverview");
const createVideoListGetter = (dataSource) => {
    const videoRepo = dataSource.getRepository(video_1.default);
    const cache = new Map();
    return (ids) => __awaiter(void 0, void 0, void 0, function* () {
        const result = [];
        for (const id of ids) {
            if (cache.has(id)) {
                result.push(cache.get(id));
            }
            else {
                // eslint-disable-next-line no-await-in-loop
                const video = yield videoRepo.findOneBy({ id });
                if (video) {
                    cache.set(id, video);
                    result.push(video);
                }
            }
        }
        return result;
    });
};
const createEventOverview = (dataSource) => (event) => __awaiter(void 0, void 0, void 0, function* () {
    const overview = Object.assign({}, event);
    if (event.type === event_1.EventType.WATCH_TIME) {
        const watchtimeRepo = dataSource.getRepository(watchTime_1.default);
        const watchtime = yield watchtimeRepo.findOneBy({ eventId: event.id });
        if (watchtime) {
            overview.data = {
                kind: 'watchtime',
                watchtime: watchtime.secondsWatched,
            };
        }
    }
    if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
        const videoListItemRepo = dataSource.getRepository(videoListItem_1.default);
        const listItems = yield videoListItemRepo.find({
            where: {
                eventId: event.id,
            },
            order: {
                position: 'ASC',
            },
        });
        const npIds = [];
        const pIds = [];
        const shownIds = [];
        const shownItems = [];
        for (const listItem of listItems) {
            if (listItem.listType === videoListItem_1.ListType.NON_PERSONALIZED) {
                npIds.push(listItem.videoId);
            }
            else if (listItem.listType === videoListItem_1.ListType.PERSONALIZED) {
                pIds.push(listItem.videoId);
            }
            else {
                shownIds.push(listItem.videoId);
                shownItems.push(listItem);
            }
        }
        const getVideos = createVideoListGetter(dataSource);
        const npVideos = yield getVideos(npIds);
        const pVideos = yield getVideos(pIds);
        const shownVideos = yield getVideos(shownIds);
        const recommendations = {
            nonPersonalized: npVideos.map(video => (Object.assign(Object.assign({}, video), { source: videoListItem_1.VideoType.NON_PERSONALIZED }))),
            personalized: pVideos.map(video => (Object.assign(Object.assign({}, video), { source: videoListItem_1.VideoType.PERSONALIZED }))),
            shown: shownVideos.map((video, i) => (Object.assign(Object.assign({}, video), { source: shownItems[i].videoType }))),
        };
        overview.data = {
            kind: 'recommendations',
            recommendations,
        };
    }
    return overview;
});
const createGetEventOverviewsRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received events overview request');
    const { sessionUuid } = req.params;
    if (!sessionUuid) {
        res.status(400).json({ kind: 'Error', message: 'Missing sessionUuid' });
        return;
    }
    const eventRepo = dataSource.getRepository(event_1.default);
    const events = yield eventRepo.find({
        where: {
            sessionUuid,
        },
        order: {
            createdAt: 'DESC',
        },
    });
    const value = yield (0, getParticipantOverview_1.asyncMap)(events)(createEventOverview(dataSource));
    res.status(200).json({ kind: 'Success', value });
});
exports.createGetEventOverviewsRoute = createGetEventOverviewsRoute;
exports.default = exports.createGetEventOverviewsRoute;
//# sourceMappingURL=getEventOverviews.js.map
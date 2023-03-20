"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createGetEventOverviewsRoute = void 0;
var event_1 = __importStar(require("../../common/models/event"));
var watchTime_1 = __importDefault(require("../models/watchTime"));
var videoListItem_1 = __importStar(require("../models/videoListItem"));
var video_1 = __importDefault(require("../models/video"));
var getParticipantOverview_1 = require("./getParticipantOverview");
var createVideoListGetter = function (dataSource) {
    var videoRepo = dataSource.getRepository(video_1["default"]);
    var cache = new Map();
    return function (ids) { return __awaiter(void 0, void 0, void 0, function () {
        var result, ids_1, ids_1_1, id, video, e_1_1;
        var e_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    ids_1 = __values(ids), ids_1_1 = ids_1.next();
                    _b.label = 2;
                case 2:
                    if (!!ids_1_1.done) return [3 /*break*/, 6];
                    id = ids_1_1.value;
                    if (!cache.has(id)) return [3 /*break*/, 3];
                    result.push(cache.get(id));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, videoRepo.findOneBy({ id: id })];
                case 4:
                    video = _b.sent();
                    if (video) {
                        cache.set(id, video);
                        result.push(video);
                    }
                    _b.label = 5;
                case 5:
                    ids_1_1 = ids_1.next();
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 9];
                case 7:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 9];
                case 8:
                    try {
                        if (ids_1_1 && !ids_1_1.done && (_a = ids_1["return"])) _a.call(ids_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/, result];
            }
        });
    }); };
};
var createEventOverview = function (dataSource) { return function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var overview, watchtimeRepo, watchtime, videoListItemRepo, listItems, npIds, pIds, shownIds, shownItems_1, listItems_1, listItems_1_1, listItem, getVideos, npVideos, pVideos, shownVideos, recommendations;
    var e_2, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                overview = __assign({}, event);
                if (!(event.type === event_1.EventType.WATCH_TIME)) return [3 /*break*/, 2];
                watchtimeRepo = dataSource.getRepository(watchTime_1["default"]);
                return [4 /*yield*/, watchtimeRepo.findOneBy({ eventId: event.id })];
            case 1:
                watchtime = _b.sent();
                if (watchtime) {
                    overview.data = {
                        kind: 'watchtime',
                        watchtime: watchtime.secondsWatched
                    };
                }
                _b.label = 2;
            case 2:
                if (!(event.type === event_1.EventType.RECOMMENDATIONS_SHOWN)) return [3 /*break*/, 7];
                videoListItemRepo = dataSource.getRepository(videoListItem_1["default"]);
                return [4 /*yield*/, videoListItemRepo.find({
                        where: {
                            eventId: event.id
                        },
                        order: {
                            position: 'ASC'
                        }
                    })];
            case 3:
                listItems = _b.sent();
                npIds = [];
                pIds = [];
                shownIds = [];
                shownItems_1 = [];
                try {
                    for (listItems_1 = __values(listItems), listItems_1_1 = listItems_1.next(); !listItems_1_1.done; listItems_1_1 = listItems_1.next()) {
                        listItem = listItems_1_1.value;
                        if (listItem.listType === videoListItem_1.ListType.NON_PERSONALIZED) {
                            npIds.push(listItem.videoId);
                        }
                        else if (listItem.listType === videoListItem_1.ListType.PERSONALIZED) {
                            pIds.push(listItem.videoId);
                        }
                        else {
                            shownIds.push(listItem.videoId);
                            shownItems_1.push(listItem);
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (listItems_1_1 && !listItems_1_1.done && (_a = listItems_1["return"])) _a.call(listItems_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                getVideos = createVideoListGetter(dataSource);
                return [4 /*yield*/, getVideos(npIds)];
            case 4:
                npVideos = _b.sent();
                return [4 /*yield*/, getVideos(pIds)];
            case 5:
                pVideos = _b.sent();
                return [4 /*yield*/, getVideos(shownIds)];
            case 6:
                shownVideos = _b.sent();
                recommendations = {
                    nonPersonalized: npVideos.map(function (video) { return (__assign(__assign({}, video), { source: videoListItem_1.VideoType.NON_PERSONALIZED })); }),
                    personalized: pVideos.map(function (video) { return (__assign(__assign({}, video), { source: videoListItem_1.VideoType.PERSONALIZED })); }),
                    shown: shownVideos.map(function (video, i) { return (__assign(__assign({}, video), { source: shownItems_1[i].videoType })); })
                };
                overview.data = {
                    kind: 'recommendations',
                    recommendations: recommendations
                };
                _b.label = 7;
            case 7: return [2 /*return*/, overview];
        }
    });
}); }; };
var createGetEventOverviewsRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, sessionUuid, eventRepo, events, value;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received events overview request');
                    sessionUuid = req.params.sessionUuid;
                    if (!sessionUuid) {
                        res.status(400).json({ kind: 'Error', message: 'Missing sessionUuid' });
                        return [2 /*return*/];
                    }
                    eventRepo = dataSource.getRepository(event_1["default"]);
                    return [4 /*yield*/, eventRepo.find({
                            where: {
                                sessionUuid: sessionUuid
                            },
                            order: {
                                createdAt: 'DESC'
                            }
                        })];
                case 1:
                    events = _a.sent();
                    return [4 /*yield*/, (0, getParticipantOverview_1.asyncMap)(events)(createEventOverview(dataSource))];
                case 2:
                    value = _a.sent();
                    res.status(200).json({ kind: 'Success', value: value });
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.createGetEventOverviewsRoute = createGetEventOverviewsRoute;
exports["default"] = exports.createGetEventOverviewsRoute;
//# sourceMappingURL=getEventOverviews.js.map
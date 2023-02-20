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
exports.createPostEventRoute = void 0;
var participant_1 = __importDefault(require("../models/participant"));
var event_1 = __importStar(require("../../common/models/event"));
var experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
var video_1 = __importDefault(require("../models/video"));
var videoListItem_1 = __importStar(require("../models/videoListItem"));
var watchTime_1 = __importDefault(require("../models/watchTime"));
var util_1 = require("../../common/util");
var storeVideos = function (repo, videos) { return __awaiter(void 0, void 0, void 0, function () {
    var ids, videos_1, videos_1_1, video, existing, newVideo, saved, e_1_1;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                ids = [];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, 10, 11]);
                videos_1 = __values(videos), videos_1_1 = videos_1.next();
                _b.label = 2;
            case 2:
                if (!!videos_1_1.done) return [3 /*break*/, 8];
                video = videos_1_1.value;
                return [4 /*yield*/, repo.findOneBy({
                        youtubeId: video.youtubeId
                    })];
            case 3:
                existing = _b.sent();
                if (!existing) return [3 /*break*/, 4];
                ids.push(existing.id);
                return [3 /*break*/, 7];
            case 4:
                newVideo = new video_1["default"]();
                Object.assign(newVideo, video);
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, (0, util_1.validateNew)(newVideo)];
            case 5:
                // eslint-disable-next-line no-await-in-loop
                _b.sent();
                return [4 /*yield*/, repo.save(newVideo)];
            case 6:
                saved = _b.sent();
                ids.push(saved.id);
                _b.label = 7;
            case 7:
                videos_1_1 = videos_1.next();
                return [3 /*break*/, 2];
            case 8: return [3 /*break*/, 11];
            case 9:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 11];
            case 10:
                try {
                    if (videos_1_1 && !videos_1_1.done && (_a = videos_1["return"])) _a.call(videos_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 11: return [2 /*return*/, ids];
        }
    });
}); };
var makeVideos = function (recommendations) {
    return recommendations.map(function (r) {
        var v = new video_1["default"]();
        v.youtubeId = r.videoId;
        v.title = r.title;
        v.url = r.url;
        return v;
    });
};
var storeItems = function (repo, eventId) { return function (videoIds, listType, videoTypes) { return __awaiter(void 0, void 0, void 0, function () {
    var i, item;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < videoIds.length)) return [3 /*break*/, 5];
                item = new videoListItem_1["default"]();
                item.videoId = videoIds[i];
                item.listType = listType;
                item.videoType = videoTypes[i];
                item.position = i;
                item.eventId = eventId;
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, (0, util_1.validateNew)(item)];
            case 2:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, repo.save(item)];
            case 3:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 1];
            case 5: return [2 /*return*/];
        }
    });
}); }; };
var storeRecommendationsShown = function (log, dataSource, event) { return __awaiter(void 0, void 0, void 0, function () {
    var videoRepo, nonPersonalized, personalized, shown, nonPersonalizedTypes, personalizedTypes, shownTypes, itemRepo, store, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log('Storing recommendations shown event meta-data');
                videoRepo = dataSource.getRepository(video_1["default"]);
                return [4 /*yield*/, storeVideos(videoRepo, makeVideos(event.nonPersonalized))];
            case 1:
                nonPersonalized = _a.sent();
                return [4 /*yield*/, storeVideos(videoRepo, makeVideos(event.personalized))];
            case 2:
                personalized = _a.sent();
                return [4 /*yield*/, storeVideos(videoRepo, makeVideos(event.shown))];
            case 3:
                shown = _a.sent();
                log('Non-personalized', nonPersonalized);
                log('Personalized', personalized);
                log('Shown', shown);
                nonPersonalizedTypes = nonPersonalized.map(function () { return videoListItem_1.VideoType.NON_PERSONALIZED; });
                personalizedTypes = personalized.map(function () { return videoListItem_1.VideoType.PERSONALIZED; });
                shownTypes = event.shown.map(function (r) {
                    if (r.personalization === 'non-personalized') {
                        return videoListItem_1.VideoType.NON_PERSONALIZED;
                    }
                    if (r.personalization === 'personalized') {
                        return videoListItem_1.VideoType.PERSONALIZED;
                    }
                    if (r.personalization === 'mixed') {
                        return videoListItem_1.VideoType.MIXED;
                    }
                    throw new Error("Invalid personalization type: ".concat(r.personalization));
                });
                itemRepo = dataSource.getRepository(videoListItem_1["default"]);
                store = storeItems(itemRepo, event.id);
                _a.label = 4;
            case 4:
                _a.trys.push([4, 8, , 9]);
                return [4 /*yield*/, store(nonPersonalized, videoListItem_1.ListType.NON_PERSONALIZED, nonPersonalizedTypes)];
            case 5:
                _a.sent();
                return [4 /*yield*/, store(personalized, videoListItem_1.ListType.PERSONALIZED, personalizedTypes)];
            case 6:
                _a.sent();
                return [4 /*yield*/, store(shown, videoListItem_1.ListType.SHOWN, shownTypes)];
            case 7:
                _a.sent();
                return [3 /*break*/, 9];
            case 8:
                err_1 = _a.sent();
                log('Error storing recommendations shown event meta-data', err_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
var storeWatchTime = function (log, dataSource, event) { return __awaiter(void 0, void 0, void 0, function () {
    var eventRepo, watchTime, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventRepo = dataSource.getRepository(watchTime_1["default"]);
                watchTime = new watchTime_1["default"]();
                watchTime.eventId = event.id;
                watchTime.secondsWatched = event.secondsWatched;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, util_1.validateNew)(watchTime)];
            case 2:
                _a.sent();
                return [4 /*yield*/, eventRepo.save(watchTime)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                err_2 = _a.sent();
                log('Error storing watch time event meta-data', err_2);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var isLocalUuidAlreadyExistsError = function (e) {
    return (0, util_1.has)('code')(e) && (0, util_1.has)('constraint')(e)
        && e.code === '23505'
        && e.constraint === 'event_local_uuid_idx';
};
var createPostEventRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, participantCode, event, participantRepo, participant, configRepo, config, errors, eventRepo, e, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received post event request');
                    participantCode = req.participantCode;
                    if (req.body.sessionUuid === undefined) {
                        log('No session UUID found');
                        res.status(500).json({ kind: 'Failure', message: 'No session UUID found' });
                        return [2 /*return*/];
                    }
                    if (typeof participantCode !== 'string' || !participantCode) {
                        log('Invalid participant code');
                        res.status(500).json({ kind: 'Failure', message: 'No participant code found' });
                        return [2 /*return*/];
                    }
                    event = new event_1["default"]();
                    Object.assign(event, req.body);
                    event.createdAt = new Date(event.createdAt);
                    event.updatedAt = new Date(event.updatedAt);
                    participantRepo = dataSource.getRepository(participant_1["default"]);
                    if (!!event.arm) return [3 /*break*/, 2];
                    return [4 /*yield*/, participantRepo.findOneBy({
                            code: participantCode
                        })];
                case 1:
                    participant = _a.sent();
                    if (!participant) {
                        log('no participant found');
                        res.status(500).json({ kind: 'Failure', message: 'No participant found' });
                        return [2 /*return*/];
                    }
                    event.arm = participant.arm;
                    _a.label = 2;
                case 2:
                    if (!!event.experimentConfigId) return [3 /*break*/, 4];
                    configRepo = dataSource.getRepository(experimentConfig_1["default"]);
                    return [4 /*yield*/, configRepo.findOneBy({
                            isCurrent: true
                        })];
                case 3:
                    config = _a.sent();
                    if (!config) {
                        log('no current config found');
                        res.status(500).json({ kind: 'Failure', message: 'No current config found' });
                        return [2 /*return*/];
                    }
                    event.experimentConfigId = config.id;
                    _a.label = 4;
                case 4: return [4 /*yield*/, (0, util_1.validateNew)(event)];
                case 5:
                    errors = _a.sent();
                    if (errors.length > 0) {
                        log('event validation failed', errors);
                        res.status(400).json({ kind: 'Failure', message: "Event validation failed: ".concat(errors.join(', '), ".") });
                        return [2 /*return*/];
                    }
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 12, , 13]);
                    eventRepo = dataSource.getRepository(event_1["default"]);
                    return [4 /*yield*/, eventRepo.save(event)];
                case 7:
                    e = _a.sent();
                    log('event saved', e);
                    res.send({ kind: 'Success', value: e });
                    if (!(event.type === event_1.EventType.RECOMMENDATIONS_SHOWN)) return [3 /*break*/, 9];
                    return [4 /*yield*/, storeRecommendationsShown(log, dataSource, event)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 9:
                    if (!(event.type === event_1.EventType.WATCH_TIME)) return [3 /*break*/, 11];
                    return [4 /*yield*/, storeWatchTime(log, dataSource, event)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    e_2 = _a.sent();
                    log('event save failed', e_2);
                    if (isLocalUuidAlreadyExistsError(e_2)) {
                        res.status(500).json({ kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK' });
                        return [2 /*return*/];
                    }
                    res.status(500).json({ kind: 'Failure', message: 'Event save failed' });
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    }); };
};
exports.createPostEventRoute = createPostEventRoute;
exports["default"] = exports.createPostEventRoute;

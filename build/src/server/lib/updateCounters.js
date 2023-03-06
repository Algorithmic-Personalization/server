"use strict";
/* eslint-disable no-await-in-loop */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.updateCounters = exports.timeSpentEventDiffLimit = exports.wholeDate = exports.toDate = exports.wholeDateAsNumber = void 0;
var participant_1 = __importDefault(require("../models/participant"));
var session_1 = __importDefault(require("../../common/models/session"));
var event_1 = __importDefault(require("../../common/models/event"));
var watchTime_1 = __importDefault(require("../models/watchTime"));
var util_1 = require("util");
var dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
var wholeDateAsNumber = function (date) {
    return new Date(date).setHours(0, 0, 0, 0);
};
exports.wholeDateAsNumber = wholeDateAsNumber;
var toDate = function (date) { return new Date(date); };
exports.toDate = toDate;
var wholeDate = function (date) { return (0, exports.toDate)((0, exports.wholeDateAsNumber)(date)); };
exports.wholeDate = wholeDate;
var Counter = /** @class */ (function () {
    function Counter() {
        this.days = new Map();
    }
    Counter.prototype.get = function (date) {
        var _a;
        return (_a = this.days.get((0, exports.wholeDateAsNumber)(date))) !== null && _a !== void 0 ? _a : 0;
    };
    Counter.prototype.set = function (date, value) {
        this.days.set((0, exports.wholeDateAsNumber)(date), value);
    };
    return Counter;
}());
var DayCounter = /** @class */ (function (_super) {
    __extends(DayCounter, _super);
    function DayCounter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DayCounter.prototype.add = function (date, value) {
        var _a;
        var existingValue = (_a = this.get(date)) !== null && _a !== void 0 ? _a : 0;
        this.set(date, existingValue + value);
    };
    return DayCounter;
}(Counter));
var mergeCounterKeys = function () {
    var e_1, _a, e_2, _b;
    var counters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        counters[_i] = arguments[_i];
    }
    var keys = new Set();
    try {
        for (var counters_1 = __values(counters), counters_1_1 = counters_1.next(); !counters_1_1.done; counters_1_1 = counters_1.next()) {
            var counter = counters_1_1.value;
            try {
                for (var _c = (e_2 = void 0, __values(counter.days.keys())), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var key = _d.value;
                    keys.add(key);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_b = _c["return"])) _b.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (counters_1_1 && !counters_1_1.done && (_a = counters_1["return"])) _a.call(counters_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var numbers = Array.from(keys);
    return numbers.map(exports.toDate);
};
exports.timeSpentEventDiffLimit = 30 * 60 * 1000;
var TimeSpentCounter = /** @class */ (function (_super) {
    __extends(TimeSpentCounter, _super);
    function TimeSpentCounter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeSpentCounter.prototype.add = function (date) {
        var _a;
        var day = (0, exports.wholeDateAsNumber)(date);
        if (!this.currentDay || day > this.currentDay) {
            this.currentDay = day;
            this.latestDate = date;
            return;
        }
        var existingValue = (_a = this.get(date)) !== null && _a !== void 0 ? _a : 0;
        var diff = Number(date) - Number(this.latestDate);
        this.latestDate = date;
        if (diff > exports.timeSpentEventDiffLimit || diff < 0) {
            return;
        }
        this.set(date, existingValue + (diff / 1000));
    };
    return TimeSpentCounter;
}(Counter));
var updateCounters = function (_a) {
    var log = _a.log, dataSource = _a.dataSource;
    return __awaiter(void 0, void 0, void 0, function () {
        var atRepo, participants, participants_1, participants_1_1, id, participant, sessions, pagesViewed, watchTimes, videoPagesViewed, sideBarClicked, timeSpent, sessions_1, sessions_1_1, session, events, events_1, events_1_1, event_2, repo, watchTime, e_3_1, e_4_1, days, activityTimes, days_1, days_1_1, day, activity, error_1, e_5_1;
        var e_5, _b, e_4, _c, e_3, _d, e_6, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    log('Updating counters...');
                    atRepo = dataSource.getRepository(dailyActivityTime_1["default"]);
                    return [4 /*yield*/, dataSource
                            .getRepository(participant_1["default"])
                            .createQueryBuilder('participant')
                            .select('participant.id', 'id')
                            .where("participant.id not in (\n\t\t\t\tselect participant_id from daily_activity_time\n\t\t)")
                            .getRawMany()];
                case 1:
                    participants = _f.sent();
                    log("Found ".concat((0, util_1.inspect)(participants), " participants to update"));
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 26, 27, 28]);
                    participants_1 = __values(participants), participants_1_1 = participants_1.next();
                    _f.label = 3;
                case 3:
                    if (!!participants_1_1.done) return [3 /*break*/, 25];
                    id = participants_1_1.value.id;
                    return [4 /*yield*/, dataSource
                            .getRepository(participant_1["default"])
                            .findOneByOrFail({ id: id })];
                case 4:
                    participant = _f.sent();
                    return [4 /*yield*/, dataSource
                            .getRepository(session_1["default"])
                            .find({
                            where: {
                                participantCode: participant.code
                            }
                        })];
                case 5:
                    sessions = _f.sent();
                    pagesViewed = new DayCounter();
                    watchTimes = new DayCounter();
                    videoPagesViewed = new DayCounter();
                    sideBarClicked = new DayCounter();
                    timeSpent = new TimeSpentCounter();
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 18, 19, 20]);
                    sessions_1 = (e_4 = void 0, __values(sessions)), sessions_1_1 = sessions_1.next();
                    _f.label = 7;
                case 7:
                    if (!!sessions_1_1.done) return [3 /*break*/, 17];
                    session = sessions_1_1.value;
                    return [4 /*yield*/, dataSource
                            .getRepository(event_1["default"])
                            .find({
                            where: {
                                sessionUuid: session.uuid
                            },
                            order: {
                                createdAt: 'ASC'
                            }
                        })];
                case 8:
                    events = _f.sent();
                    _f.label = 9;
                case 9:
                    _f.trys.push([9, 14, 15, 16]);
                    events_1 = (e_3 = void 0, __values(events)), events_1_1 = events_1.next();
                    _f.label = 10;
                case 10:
                    if (!!events_1_1.done) return [3 /*break*/, 13];
                    event_2 = events_1_1.value;
                    if (event_2.type === 'PAGE_VIEW') {
                        pagesViewed.add(event_2.createdAt, 1);
                        timeSpent.add(event_2.createdAt);
                        // eslint-disable-next-line max-depth
                        if (event_2.url.includes('/watch')) {
                            videoPagesViewed.add(event_2.createdAt, 1);
                        }
                    }
                    if (event_2.type === 'PERSONALIZED_CLICKED') {
                        sideBarClicked.add(event_2.createdAt, 1);
                    }
                    else if (event_2.type === 'NON_PERSONALIZED_CLICKED') {
                        sideBarClicked.add(event_2.createdAt, 1);
                    }
                    else if (event_2.type === 'MIXED_CLICKED') {
                        sideBarClicked.add(event_2.createdAt, 1);
                    }
                    if (!(event_2.type === 'WATCH_TIME')) return [3 /*break*/, 12];
                    repo = dataSource.getRepository(watchTime_1["default"]);
                    return [4 /*yield*/, repo.findOneOrFail({
                            where: {
                                eventId: event_2.id
                            }
                        })];
                case 11:
                    watchTime = _f.sent();
                    watchTimes.add(event_2.createdAt, watchTime.secondsWatched);
                    _f.label = 12;
                case 12:
                    events_1_1 = events_1.next();
                    return [3 /*break*/, 10];
                case 13: return [3 /*break*/, 16];
                case 14:
                    e_3_1 = _f.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 16];
                case 15:
                    try {
                        if (events_1_1 && !events_1_1.done && (_d = events_1["return"])) _d.call(events_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 16:
                    sessions_1_1 = sessions_1.next();
                    return [3 /*break*/, 7];
                case 17: return [3 /*break*/, 20];
                case 18:
                    e_4_1 = _f.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 20];
                case 19:
                    try {
                        if (sessions_1_1 && !sessions_1_1.done && (_c = sessions_1["return"])) _c.call(sessions_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 20:
                    days = mergeCounterKeys(pagesViewed, watchTimes, videoPagesViewed, timeSpent);
                    activityTimes = [];
                    try {
                        for (days_1 = (e_6 = void 0, __values(days)), days_1_1 = days_1.next(); !days_1_1.done; days_1_1 = days_1.next()) {
                            day = days_1_1.value;
                            activity = new dailyActivityTime_1["default"]();
                            activity.pagesViewed = pagesViewed.get(day);
                            activity.videoTimeViewedSeconds = watchTimes.get(day);
                            activity.videoPagesViewed = videoPagesViewed.get(day);
                            activity.timeSpentOnYoutubeSeconds = timeSpent.get(day);
                            activity.sidebarRecommendationsClicked = sideBarClicked.get(day);
                            activity.participantId = participant.id;
                            activity.createdAt = day;
                            activityTimes.push(activity);
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (days_1_1 && !days_1_1.done && (_e = days_1["return"])) _e.call(days_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                    _f.label = 21;
                case 21:
                    _f.trys.push([21, 23, , 24]);
                    return [4 /*yield*/, atRepo.save(activityTimes)];
                case 22:
                    _f.sent();
                    if (activityTimes.length > 0) {
                        log("Saved activity times for ".concat(activityTimes.length, " participants"));
                    }
                    return [3 /*break*/, 24];
                case 23:
                    error_1 = _f.sent();
                    log("Error saving activity times for participant ".concat(participant.id, ":"), error_1);
                    log('Activity times:', activityTimes);
                    return [3 /*break*/, 24];
                case 24:
                    participants_1_1 = participants_1.next();
                    return [3 /*break*/, 3];
                case 25: return [3 /*break*/, 28];
                case 26:
                    e_5_1 = _f.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 28];
                case 27:
                    try {
                        if (participants_1_1 && !participants_1_1.done && (_b = participants_1["return"])) _b.call(participants_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                    return [7 /*endfinally*/];
                case 28: return [2 /*return*/];
            }
        });
    });
};
exports.updateCounters = updateCounters;
exports["default"] = exports.updateCounters;

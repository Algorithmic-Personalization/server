"use strict";
/* eslint-disable no-await-in-loop */
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
exports.updateCounters = exports.timeSpentEventDiffLimit = exports.wholeDate = exports.toDate = exports.wholeDateAsNumber = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const session_1 = __importDefault(require("../../common/models/session"));
const event_1 = __importDefault(require("../../common/models/event"));
const watchTime_1 = __importDefault(require("../models/watchTime"));
const util_1 = require("util");
const dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
const wholeDateAsNumber = (date) => new Date(date).setHours(0, 0, 0, 0);
exports.wholeDateAsNumber = wholeDateAsNumber;
const toDate = (date) => new Date(date);
exports.toDate = toDate;
const wholeDate = (date) => (0, exports.toDate)((0, exports.wholeDateAsNumber)(date));
exports.wholeDate = wholeDate;
class Counter {
    constructor() {
        this.days = new Map();
    }
    get(date) {
        var _a;
        return (_a = this.days.get((0, exports.wholeDateAsNumber)(date))) !== null && _a !== void 0 ? _a : 0;
    }
    set(date, value) {
        this.days.set((0, exports.wholeDateAsNumber)(date), value);
    }
}
class DayCounter extends Counter {
    add(date, value) {
        var _a;
        const existingValue = (_a = this.get(date)) !== null && _a !== void 0 ? _a : 0;
        this.set(date, existingValue + value);
    }
}
const mergeCounterKeys = (...counters) => {
    const keys = new Set();
    for (const counter of counters) {
        for (const key of counter.days.keys()) {
            keys.add(key);
        }
    }
    const numbers = Array.from(keys);
    return numbers.map(exports.toDate);
};
exports.timeSpentEventDiffLimit = 30 * 60 * 1000;
class TimeSpentCounter extends Counter {
    add(date) {
        var _a;
        const day = (0, exports.wholeDateAsNumber)(date);
        if (!this.currentDay || day > this.currentDay) {
            this.currentDay = day;
            this.latestDate = date;
            return;
        }
        const existingValue = (_a = this.get(date)) !== null && _a !== void 0 ? _a : 0;
        const diff = Number(date) - Number(this.latestDate);
        this.latestDate = date;
        if (diff > exports.timeSpentEventDiffLimit || diff < 0) {
            return;
        }
        this.set(date, existingValue + (diff / 1000));
    }
}
const updateCounters = ({ log, dataSource, }) => __awaiter(void 0, void 0, void 0, function* () {
    log('Updating counters...');
    const atRepo = dataSource.getRepository(dailyActivityTime_1.default);
    const participants = yield dataSource
        .getRepository(participant_1.default)
        .createQueryBuilder('participant')
        .select('participant.id', 'id')
        .where(`participant.id not in (
				select participant_id from daily_activity_time
		)`)
        .getRawMany();
    log(`Found ${(0, util_1.inspect)(participants)} participants to update`);
    for (const { id } of participants) {
        const participant = yield dataSource
            .getRepository(participant_1.default)
            .findOneByOrFail({ id });
        const sessions = yield dataSource
            .getRepository(session_1.default)
            .find({
            where: {
                participantCode: participant.code,
            },
        });
        const pagesViewed = new DayCounter();
        const watchTimes = new DayCounter();
        const videoPagesViewed = new DayCounter();
        const sideBarClicked = new DayCounter();
        const timeSpent = new TimeSpentCounter();
        for (const session of sessions) {
            const events = yield dataSource
                .getRepository(event_1.default)
                .find({
                where: {
                    sessionUuid: session.uuid,
                },
                order: {
                    createdAt: 'ASC',
                },
            });
            for (const event of events) {
                if (event.type === 'PAGE_VIEW') {
                    pagesViewed.add(event.createdAt, 1);
                    timeSpent.add(event.createdAt);
                    // eslint-disable-next-line max-depth
                    if (event.url.includes('/watch')) {
                        videoPagesViewed.add(event.createdAt, 1);
                    }
                }
                if (event.type === 'PERSONALIZED_CLICKED') {
                    sideBarClicked.add(event.createdAt, 1);
                }
                else if (event.type === 'NON_PERSONALIZED_CLICKED') {
                    sideBarClicked.add(event.createdAt, 1);
                }
                else if (event.type === 'MIXED_CLICKED') {
                    sideBarClicked.add(event.createdAt, 1);
                }
                if (event.type === 'WATCH_TIME') {
                    const repo = dataSource.getRepository(watchTime_1.default);
                    const watchTime = yield repo.findOneOrFail({
                        where: {
                            eventId: event.id,
                        },
                    });
                    watchTimes.add(event.createdAt, watchTime.secondsWatched);
                }
            }
        }
        const days = mergeCounterKeys(pagesViewed, watchTimes, videoPagesViewed, timeSpent);
        const activityTimes = [];
        for (const day of days) {
            const activity = new dailyActivityTime_1.default();
            activity.pagesViewed = pagesViewed.get(day);
            activity.videoTimeViewedSeconds = watchTimes.get(day);
            activity.videoPagesViewed = videoPagesViewed.get(day);
            activity.timeSpentOnYoutubeSeconds = timeSpent.get(day);
            activity.sidebarRecommendationsClicked = sideBarClicked.get(day);
            activity.participantId = participant.id;
            activity.createdAt = day;
            activityTimes.push(activity);
        }
        try {
            yield atRepo.save(activityTimes);
            if (activityTimes.length > 0) {
                log(`Saved activity times for ${activityTimes.length} participants`);
            }
        }
        catch (error) {
            log(`Error saving activity times for participant ${participant.id}:`, error);
            log('Activity times:', activityTimes);
        }
    }
});
exports.updateCounters = updateCounters;
exports.default = exports.updateCounters;
//# sourceMappingURL=updateCounters.js.map
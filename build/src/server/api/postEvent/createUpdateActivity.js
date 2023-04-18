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
exports.createUpdateActivity = void 0;
const typeorm_1 = require("typeorm");
const event_1 = require("../../../common/models/event");
const dailyActivityTime_1 = __importDefault(require("../../models/dailyActivityTime"));
const updateCounters_1 = require("../../lib/updateCounters");
const getOrCreateActivity = (repo, participantId, day) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield repo.findOneBy({
        participantId,
        createdAt: day,
    });
    if (existing) {
        return existing;
    }
    const newActivity = new dailyActivityTime_1.default();
    newActivity.participantId = participantId;
    newActivity.createdAt = day;
    return repo.save(newActivity);
});
const createUpdateActivity = ({ activityRepo, eventRepo, log }) => (participant, event) => __awaiter(void 0, void 0, void 0, function* () {
    log('Updating activity for participant ', participant.code);
    const day = (0, updateCounters_1.wholeDate)(event.createdAt);
    const activity = yield getOrCreateActivity(activityRepo, participant.id, day);
    if (event.type === event_1.EventType.PAGE_VIEW) {
        const latestSessionEvent = yield eventRepo
            .findOne({
            where: {
                sessionUuid: event.sessionUuid,
                createdAt: (0, typeorm_1.LessThan)(event.createdAt),
            },
            order: {
                createdAt: 'DESC',
            },
        });
        const dt = latestSessionEvent
            ? Number(event.createdAt) - Number(latestSessionEvent.createdAt)
            : 0;
        if (dt < updateCounters_1.timeSpentEventDiffLimit && dt > 0) {
            const dtS = dt / 1000;
            log('Time since last event:', dtS);
            activity.timeSpentOnYoutubeSeconds += dtS;
        }
    }
    if (event.type === event_1.EventType.WATCH_TIME) {
        activity.videoTimeViewedSeconds += event.secondsWatched;
    }
    if (event.type === event_1.EventType.PAGE_VIEW) {
        activity.pagesViewed += 1;
        if (event.url.includes('/watch')) {
            activity.videoPagesViewed += 1;
        }
    }
    if (event.type === 'PERSONALIZED_CLICKED'
        || event.type === 'NON_PERSONALIZED_CLICKED'
        || event.type === 'MIXED_CLICKED') {
        activity.sidebarRecommendationsClicked += 1;
    }
    activity.updatedAt = new Date();
    yield activityRepo.save(activity);
});
exports.createUpdateActivity = createUpdateActivity;
exports.default = exports.createUpdateActivity;
//# sourceMappingURL=createUpdateActivity.js.map
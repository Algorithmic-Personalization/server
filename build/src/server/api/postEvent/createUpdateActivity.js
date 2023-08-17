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
const util_1 = require("../../../util");
const util_2 = require("../../../common/util");
const createActivateExtension_1 = require("./createActivateExtension");
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
const createUpdateActivity = ({ dataSource, activityRepo, eventRepo, notifier, log }) => (participant, event) => __awaiter(void 0, void 0, void 0, function* () {
    log('Updating activity for participant ', participant.code);
    const day = (0, updateCounters_1.wholeDate)(event.createdAt);
    const activity = yield getOrCreateActivity(activityRepo, participant.id, day);
    if (event.type === event_1.EventType.PAGE_VIEW) {
        const latestSessionEvent = yield eventRepo
            .findOne({
            where: {
                sessionUuid: event.sessionUuid,
                createdAt: (0, typeorm_1.LessThan)(event.createdAt),
                type: event_1.EventType.PAGE_VIEW,
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
    /* Handle activation of extension */
    const isActiveParticipant = () => __awaiter(void 0, void 0, void 0, function* () {
        // 3 pages viewed
        const minPagesViewed = 3;
        // 5 minutes spent on YouTube
        const minMinutesOnYouTube = 5;
        const qb = dataSource.createQueryBuilder();
        const show = (0, util_1.showSql)(log);
        const pagesViewed = yield show(qb.select('SUM(pages_viewed)', 'pages_viewed')
            .from('daily_activity_time', 'dat')
            .where('dat.participant_id = :participantId', { participantId: participant.id })).getRawOne();
        log(`Pages viewed by ${participant.id}:`, pagesViewed);
        if (!(0, util_2.has)('pages_viewed')(pagesViewed)) {
            log('error', 'pages_viewed not found (while checking if participant is active)');
            return false;
        }
        const { pages_viewed: pagesViewedRaw } = pagesViewed;
        if (typeof pagesViewedRaw !== 'string') {
            log('error', 'pagesViewedRaw is not a string (while checking if participant is active)');
            return false;
        }
        const pagesViewedNum = Number(pagesViewedRaw);
        if (isNaN(pagesViewedNum)) {
            log('error', 'pagesViewedNum is NaN (while checking if participant is active)');
            return false;
        }
        log('Pages viewed:', pagesViewedNum);
        if (pagesViewedNum < minPagesViewed) {
            log('info', `Not enough pages viewed (need ${minPagesViewed}, got ${pagesViewedNum})`);
            return false;
        }
        // 5 minutes spent on youtube
        const timeSpentOnYouTubeSeconds = yield show(qb.select('SUM(time_spent_on_youtube_seconds)', 'ts')
            .where('dat.participant_id = :participantId', { participantId: participant.id })).getRawOne();
        log(`Time spent on YouTube by ${participant.id} in seconds:`, timeSpentOnYouTubeSeconds);
        if (!(0, util_2.has)('ts')(timeSpentOnYouTubeSeconds)) {
            log('error', 'timeSpentOnYouTubeSeconds not found (while checking if participant is active)');
            return false;
        }
        const { ts: secondsOnYouTube } = timeSpentOnYouTubeSeconds;
        if (typeof secondsOnYouTube !== 'number') {
            log('error', 'secondsOnYouTube is not a number (while checking if participant is active)');
            return false;
        }
        const minutesOnYouTube = secondsOnYouTube / 60;
        if (minutesOnYouTube < minMinutesOnYouTube) {
            log('info', `Not enough minutes spent on YouTube (need ${minMinutesOnYouTube}, got ${minutesOnYouTube})`);
            return false;
        }
        log('info', `Participant ${participant.id} is active!`);
        return true;
    });
    if (participant.extensionActivatedAt === null && (yield isActiveParticipant())) {
        const activateExtension = (0, createActivateExtension_1.createActivateExtension)({
            dataSource,
            activityNotifier: notifier.makeParticipantNotifier({
                participantCode: participant.code,
                participantId: participant.id,
                isPaid: participant.isPaid,
            }),
            log,
        });
        void activateExtension(event, participant);
    }
});
exports.createUpdateActivity = createUpdateActivity;
exports.default = exports.createUpdateActivity;
//# sourceMappingURL=createUpdateActivity.js.map
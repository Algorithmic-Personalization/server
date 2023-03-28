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
exports.createPostEventRoute = void 0;
const typeorm_1 = require("typeorm");
const participant_1 = __importDefault(require("../models/participant"));
const event_1 = __importStar(require("../../common/models/event"));
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const video_1 = __importDefault(require("../models/video"));
const videoListItem_1 = __importStar(require("../models/videoListItem"));
const watchTime_1 = __importDefault(require("../models/watchTime"));
const util_1 = require("../../common/util");
const dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
const updateCounters_1 = require("../lib/updateCounters");
const transitionSetting_1 = __importStar(require("../models/transitionSetting"));
const transitionEvent_1 = __importStar(require("../models/transitionEvent"));
const util_2 = require("../../util");
const storeVideos = (repo, videos) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = [];
    for (const video of videos) {
        // eslint-disable-next-line no-await-in-loop
        const existing = yield repo.findOneBy({
            youtubeId: video.youtubeId,
        });
        if (existing) {
            ids.push(existing.id);
        }
        else {
            const newVideo = new video_1.default();
            Object.assign(newVideo, video);
            // eslint-disable-next-line no-await-in-loop
            yield (0, util_1.validateNew)(newVideo);
            // eslint-disable-next-line no-await-in-loop
            const saved = yield repo.save(newVideo);
            ids.push(saved.id);
        }
    }
    return ids;
});
const makeVideos = (recommendations) => recommendations.map(r => {
    const v = new video_1.default();
    v.youtubeId = r.videoId;
    v.title = r.title;
    v.url = r.url;
    return v;
});
const storeItems = (repo, eventId) => (videoIds, listType, videoTypes) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < videoIds.length; i++) {
        const item = new videoListItem_1.default();
        item.videoId = videoIds[i];
        item.listType = listType;
        item.videoType = videoTypes[i];
        item.position = i;
        item.eventId = eventId;
        // eslint-disable-next-line no-await-in-loop
        yield (0, util_1.validateNew)(item);
        // eslint-disable-next-line no-await-in-loop
        yield repo.save(item);
    }
});
const storeRecommendationsShown = (log, dataSource, event) => __awaiter(void 0, void 0, void 0, function* () {
    log('Storing recommendations shown event meta-data');
    const videoRepo = dataSource.getRepository(video_1.default);
    const nonPersonalized = yield storeVideos(videoRepo, makeVideos(event.nonPersonalized));
    const personalized = yield storeVideos(videoRepo, makeVideos(event.personalized));
    const shown = yield storeVideos(videoRepo, makeVideos(event.shown));
    log('Non-personalized', nonPersonalized);
    log('Personalized', personalized);
    log('Shown', shown);
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
        yield store(nonPersonalized, videoListItem_1.ListType.NON_PERSONALIZED, nonPersonalizedTypes);
        yield store(personalized, videoListItem_1.ListType.PERSONALIZED, personalizedTypes);
        yield store(shown, videoListItem_1.ListType.SHOWN, shownTypes);
    }
    catch (err) {
        log('Error storing recommendations shown event meta-data', err);
    }
});
const storeWatchTime = (log, dataSource, event) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepo = dataSource.getRepository(watchTime_1.default);
    const watchTime = new watchTime_1.default();
    watchTime.eventId = event.id;
    watchTime.secondsWatched = event.secondsWatched;
    try {
        yield (0, util_1.validateNew)(watchTime);
        yield eventRepo.save(watchTime);
    }
    catch (err) {
        log('Error storing watch time event meta-data', err);
    }
});
const isLocalUuidAlreadyExistsError = (e) => (0, util_1.has)('code')(e) && (0, util_1.has)('constraint')(e)
    && e.code === '23505'
    && e.constraint === 'event_local_uuid_idx';
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
const activityMatches = (setting, activity) => {
    let criteriaOk = 0;
    const criteriaCount = 5;
    if (activity.timeSpentOnYoutubeSeconds >= setting.minTimeSpentOnYoutubeSeconds) {
        criteriaOk += 1;
    }
    if (activity.videoTimeViewedSeconds >= setting.minVideoTimeViewedSeconds) {
        criteriaOk += 1;
    }
    if (activity.pagesViewed >= setting.minPagesViewed) {
        criteriaOk += 1;
    }
    if (activity.videoPagesViewed >= setting.minVideoPagesViewed) {
        criteriaOk += 1;
    }
    if (activity.sidebarRecommendationsClicked >= setting.minSidebarRecommendationsClicked) {
        criteriaOk += 1;
    }
    if (setting.operator === transitionSetting_1.OperatorType.ALL) {
        return criteriaOk === criteriaCount;
    }
    return criteriaOk > 0;
};
const shouldTriggerPhaseTransition = (setting, activities) => {
    let matchingDays = 0;
    const transition = new transitionEvent_1.default();
    for (const activity of activities) {
        const matches = activityMatches(setting, activity);
        if (matches) {
            matchingDays += 1;
            transition.timeSpentOnYoutubeSeconds += activity.timeSpentOnYoutubeSeconds;
            transition.videoTimeViewedSeconds += activity.videoTimeViewedSeconds;
            transition.pagesViewed += activity.pagesViewed;
            transition.videoPagesViewed += activity.videoPagesViewed;
            transition.sidebarRecommendationsClicked += activity.sidebarRecommendationsClicked;
        }
    }
    transition.numDays = matchingDays;
    if (matchingDays >= setting.minDays) {
        return transition;
    }
    return undefined;
};
const createUpdatePhase = ({ dataSource, log, }) => (participant, latestEvent) => __awaiter(void 0, void 0, void 0, function* () {
    log('updating participant phase if needed...');
    if (participant.phase === transitionSetting_1.Phase.POST_EXPERIMENT) {
        log('participant in post-experiment, no need to check for phase transition, skipping');
        return;
    }
    // Find the right transition settings to apply
    const fromPhase = participant.phase;
    const toPhase = fromPhase === transitionSetting_1.Phase.PRE_EXPERIMENT
        ? transitionSetting_1.Phase.EXPERIMENT
        : transitionSetting_1.Phase.POST_EXPERIMENT;
    const transitionSettingRepo = dataSource.getRepository(transitionSetting_1.default);
    const setting = yield transitionSettingRepo.findOneBy({
        fromPhase,
        toPhase,
        isCurrent: true,
    });
    if (!setting) {
        log('/!\\ no transition setting from', fromPhase, 'to', toPhase, 'found, skipping - this is probably a bug or a misconfiguration');
        return;
    }
    log('transition setting from phase', fromPhase, 'to phase', toPhase, 'found:', setting);
    // Find the entry date of participant in the phase they're currently in
    const transitionRepo = dataSource.getRepository(transitionEvent_1.default);
    const latestTransition = yield transitionRepo.findOne({
        where: {
            toPhase: participant.phase,
            participantId: participant.id,
        },
        order: {
            id: 'DESC',
        },
    });
    const entryDate = latestTransition ? latestTransition.createdAt : participant.createdAt;
    // Get all statistics for the participant after entry into current phase
    const activityRepo = dataSource.getRepository(dailyActivityTime_1.default);
    const activities = yield activityRepo.find({
        where: {
            participantId: participant.id,
            createdAt: (0, typeorm_1.MoreThan)(entryDate),
        },
    });
    log('found', activities.length, 'activities for participant', participant.id, 'after entry date', entryDate, 'into phase', participant.phase);
    const transitionEvent = shouldTriggerPhaseTransition(setting, activities);
    if (transitionEvent) {
        log('triggering transition from phase', fromPhase, 'to phase', toPhase);
        const triggerEvent = new event_1.default();
        Object.assign(triggerEvent, latestEvent);
        triggerEvent.id = 0;
        triggerEvent.type = event_1.EventType.PHASE_TRANSITION;
        transitionEvent.participantId = participant.id;
        transitionEvent.fromPhase = fromPhase;
        transitionEvent.toPhase = toPhase;
        transitionEvent.reason = transitionEvent_1.TransitionReason.AUTOMATIC;
        transitionEvent.transitionSettingId = setting.id;
        participant.phase = toPhase;
        yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            const trigger = yield manager.save(triggerEvent);
            transitionEvent.eventId = trigger.id;
            yield manager.save(transitionEvent);
            yield manager.save(participant);
        }));
    }
    else {
        log('no phase transition needed at this point');
    }
});
const summarizeForDisplay = (event) => {
    const summary = Object.assign({}, event);
    if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
        const e = event;
        summary.nonPersonalized = e.nonPersonalized.length;
        summary.personalized = e.personalized.length;
        summary.shown = e.shown.length;
    }
    return summary;
};
const createPostEventRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received post event request');
    const { participantCode } = req;
    if (req.body.sessionUuid === undefined) {
        log('No session UUID found');
        res.status(500).json({ kind: 'Failure', message: 'No session UUID found' });
        return;
    }
    if (typeof participantCode !== 'string' || !participantCode) {
        log('Invalid participant code');
        res.status(500).json({ kind: 'Failure', message: 'No participant code found' });
        return;
    }
    const event = new event_1.default();
    Object.assign(event, req.body);
    event.createdAt = new Date(event.createdAt);
    event.updatedAt = new Date(event.updatedAt);
    const participantRepo = dataSource.getRepository(participant_1.default);
    const activityRepo = dataSource.getRepository(dailyActivityTime_1.default);
    const eventRepo = dataSource.getRepository(event_1.default);
    const updateActivity = createUpdateActivity({
        activityRepo,
        eventRepo,
        log,
    });
    const updatePhase = createUpdatePhase({
        dataSource,
        log,
    });
    const participant = yield participantRepo.findOneBy({
        code: participantCode,
    });
    if (!participant) {
        log('no participant found');
        res.status(500).json({ kind: 'Failure', message: 'No participant found' });
        return;
    }
    const withParticipantLock = (0, util_2.withLock)(`participant-${participant.id}`);
    event.arm = participant.arm;
    event.phase = participant.phase;
    if (!event.experimentConfigId) {
        const configRepo = dataSource.getRepository(experimentConfig_1.default);
        const config = yield configRepo.findOneBy({
            isCurrent: true,
        });
        if (!config) {
            log('no current config found');
            res.status(500).json({ kind: 'Failure', message: 'No current config found' });
            return;
        }
        event.experimentConfigId = config.id;
    }
    const errors = yield (0, util_1.validateExcept)('id', 'tabActive')(event);
    if (errors.length > 0) {
        log('event validation failed', errors);
        res.status(400).json({ kind: 'Failure', message: `Event validation failed: ${errors.join(', ')}.` });
        return;
    }
    try {
        yield withParticipantLock(() => __awaiter(void 0, void 0, void 0, function* () {
            log('updating activity and phase for participant', participant.id);
            yield updateActivity(participant, event);
            yield updatePhase(participant, event);
        }), log);
    }
    catch (e) {
        log('activity update failed', e);
    }
    try {
        const e = yield eventRepo.save(event);
        log('event saved', summarizeForDisplay(e));
        res.send({ kind: 'Success', value: e });
        if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
            yield storeRecommendationsShown(log, dataSource, event);
        }
        else if (event.type === event_1.EventType.WATCH_TIME) {
            yield storeWatchTime(log, dataSource, event);
        }
    }
    catch (e) {
        if (isLocalUuidAlreadyExistsError(e)) {
            res.status(500).json({ kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK' });
            return;
        }
        log('event save failed', e);
        res.status(500).json({ kind: 'Failure', message: 'Event save failed' });
    }
});
exports.createPostEventRoute = createPostEventRoute;
exports.default = exports.createPostEventRoute;
//# sourceMappingURL=postEvent.js.map
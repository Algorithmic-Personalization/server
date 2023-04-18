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
exports.createPostEventRoute = exports.shouldTriggerPhaseTransition = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const event_1 = __importStar(require("../../common/models/event"));
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const util_1 = require("../../common/util");
const dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
const transitionSetting_1 = require("../models/transitionSetting");
const transitionEvent_1 = __importDefault(require("../models/transitionEvent"));
const handleExtensionInstalledEvent_1 = __importDefault(require("./postEvent/handleExtensionInstalledEvent"));
const updateParticipantPhase_1 = __importDefault(require("./postEvent/updateParticipantPhase"));
const createUpdateActivity_1 = __importDefault(require("./postEvent/createUpdateActivity"));
const storeWatchTime_1 = __importDefault(require("./postEvent/storeWatchTime"));
const storeRecommendationsShown_1 = __importDefault(require("../lib/storeRecommendationsShown"));
const util_2 = require("../../util");
const isLocalUuidAlreadyExistsError = (e) => (0, util_1.has)('code')(e) && (0, util_1.has)('constraint')(e)
    && e.code === '23505'
    && e.constraint === 'event_local_uuid_idx';
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
exports.shouldTriggerPhaseTransition = shouldTriggerPhaseTransition;
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
const createPostEventRoute = ({ createLogger, dataSource, installedEventConfig, youTubeConfig, }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const updateActivity = (0, createUpdateActivity_1.default)({
        activityRepo,
        eventRepo,
        log,
    });
    const updatePhase = (0, updateParticipantPhase_1.default)({
        dataSource,
        log,
    });
    const handleExtensionInstalledEvent = (0, handleExtensionInstalledEvent_1.default)(dataSource, installedEventConfig, log);
    const storeWatchTime = (0, storeWatchTime_1.default)({
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
        if (event.type === event_1.EventType.EXTENSION_INSTALLED) {
            yield handleExtensionInstalledEvent(participant.id, event);
            res.send({ kind: 'Success', value: 'Extension installed event handled' });
        }
        else {
            const e = yield eventRepo.save(event);
            log('event saved', summarizeForDisplay(e));
            res.send({ kind: 'Success', value: e });
            if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
                yield (0, storeRecommendationsShown_1.default)({
                    dataSource,
                    youTubeConfig,
                    event: event,
                    log,
                });
            }
            else if (event.type === event_1.EventType.WATCH_TIME) {
                yield storeWatchTime(event);
            }
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
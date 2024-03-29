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
const transitionSetting_1 = require("../models/transitionSetting");
const transitionEvent_1 = __importDefault(require("../models/transitionEvent"));
const updateParticipantPhase_1 = __importDefault(require("./postEvent/updateParticipantPhase"));
const createUpdateActivity_1 = __importDefault(require("./postEvent/createUpdateActivity"));
const storeWatchTime_1 = __importDefault(require("./postEvent/storeWatchTime"));
const handleExtensionInstalledEvent_1 = __importDefault(require("./postEvent/handleExtensionInstalledEvent"));
const storeRecommendationsShown_1 = __importStar(require("../lib/storeRecommendationsShown"));
const async_lock_1 = __importDefault(require("async-lock"));
const channelSourceGetForParticipant_1 = require("../api-2/channelSourceGetForParticipant");
const isLocalUuidAlreadyExistsError = (e) => (0, util_1.has)('code')(e) && (0, util_1.has)('constraint')(e)
    && e.code === '23505'
    && e.constraint === 'event_local_uuid_idx';
const isSessionUuidAlreadyExistsError = (e) => (0, util_1.has)('code')(e) && (0, util_1.has)('constraint')(e)
    && e.code === '23503'
    && e.constraint === 'event_session_uuid_fkey';
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
    var _a, _b;
    const summary = Object.assign({}, event);
    if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
        const e = event;
        summary.nonPersonalized = e.nonPersonalized.length;
        summary.personalized = e.personalized.length;
    }
    if (event.type === event_1.EventType.HOME_SHOWN) {
        const e = event;
        summary.defaultRecommendations = e.defaultRecommendations.length;
        summary.replacementSource = e.replacementSource.length;
        summary.shown = (_b = (_a = e.shown) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    return summary;
};
const createPostEventRoute = ({ createLogger, dataSource, youTubeConfig, notifier, }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received post event request');
    const { participantCode } = req;
    const lock = new async_lock_1.default();
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
    event.localZeroHour = event.localZeroHour ? new Date(event.localZeroHour) : undefined;
    const participantRepo = dataSource.getRepository(participant_1.default);
    const eventRepo = dataSource.getRepository(event_1.default);
    const updateActivity = (0, createUpdateActivity_1.default)({
        dataSource,
        notifier,
        log,
    });
    const updatePhase = (0, updateParticipantPhase_1.default)({
        dataSource,
        notifier,
        log,
    });
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
    const handleInstall = (0, handleExtensionInstalledEvent_1.default)({
        dataSource,
        notifier: notifier.makeParticipantNotifier({
            participantCode,
            participantId: participant.id,
            isPaid: participant.isPaid,
        }),
        log,
    });
    if (event.type === event_1.EventType.PAGE_VIEW) {
        handleInstall(participant, event).catch(e => {
            log('error', 'failed to handle install event', e);
        });
    }
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
        log('error', 'event validation failed', { errors, event });
        res.status(400).json({ kind: 'Failure', message: `Event validation failed: ${errors.join(', ')}.` });
        return;
    }
    try {
        const e = yield eventRepo.save(event);
        log('event saved', summarizeForDisplay(e));
        // Update the things the response doesn't depend upon in parallel
        lock.acquire(`participant-${participant.id}`, () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield updateActivity(participant, e);
                yield updatePhase(participant, e);
            }
            catch (e) {
                log('error', 'activity update failed', e);
            }
        })).catch(e => {
            log('error', 'failed to acquire participant lock', e);
        });
        if (event.type === event_1.EventType.RECOMMENDATIONS_SHOWN) {
            (0, storeRecommendationsShown_1.default)({
                dataSource,
                youTubeConfig,
                event: event,
                log,
            }).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
                log('error', 'recommendations store failed', err);
            }));
        }
        else if (event.type === event_1.EventType.WATCH_TIME) {
            storeWatchTime(event).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
                log('error', 'watch time store failed', err);
            }));
        }
        if (event.type === event_1.EventType.HOME_SHOWN) {
            (0, storeRecommendationsShown_1.storeHomeShownVideos)({
                dataSource,
                event: event,
                log,
                youTubeConfig,
            }).catch((err) => __awaiter(void 0, void 0, void 0, function* () {
                log('error', 'home shown store failed', err);
            }));
        }
        if (event.type === event_1.EventType.HOME_INJECTED_TILE_CLICKED) {
            const postProcess = () => __awaiter(void 0, void 0, void 0, function* () {
                const qr = dataSource.createQueryRunner();
                try {
                    yield qr.connect();
                    yield qr.startTransaction();
                    const participant = yield qr.manager.getRepository(participant_1.default).findOneOrFail({
                        where: {
                            code: participantCode,
                        },
                    });
                    const update = (0, channelSourceGetForParticipant_1.updateIfNeededAndGetParticipantChannelSource)(qr, log);
                    yield update(participant, true);
                    yield qr.commitTransaction();
                }
                catch (err) {
                    if (qr.isTransactionActive) {
                        yield qr.rollbackTransaction();
                    }
                    console.error('error', 'failed to (maybe-) advance participant in its channel source', err);
                }
                finally {
                    yield qr.release();
                }
            });
            postProcess().catch(e => {
                log('error', 'failed to update participant channel source', e);
            });
        }
        res.send({ kind: 'Success', value: e });
    }
    catch (e) {
        if (isLocalUuidAlreadyExistsError(e) || isSessionUuidAlreadyExistsError(e)) {
            res.status(200).json({ kind: 'Failure', message: 'Event already exists', code: 'EVENT_ALREADY_EXISTS_OK' });
            return;
        }
        log('event save failed', e);
        res.status(500).json({ kind: 'Failure', message: 'Event save failed' });
    }
});
exports.createPostEventRoute = createPostEventRoute;
exports.default = exports.createPostEventRoute;
//# sourceMappingURL=postEvent.js.map
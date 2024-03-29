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
exports.createUpdatePhase = void 0;
const typeorm_1 = require("typeorm");
const dailyActivityTime_1 = __importDefault(require("../../models/dailyActivityTime"));
const transitionSetting_1 = __importStar(require("../../models/transitionSetting"));
const transitionEvent_1 = __importStar(require("../../models/transitionEvent"));
const postEvent_1 = require("../postEvent");
const participant_1 = require("../../lib/participant");
const createUpdatePhase = ({ dataSource, notifier, log, }) => (participant, latestEvent) => __awaiter(void 0, void 0, void 0, function* () {
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
    const getTransition = () => __awaiter(void 0, void 0, void 0, function* () {
        if ((0, transitionSetting_1.allZeros)(setting)) {
            const elapsedDays = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
            if (elapsedDays >= setting.minDays) {
                log('info', 'transitioning participant', participant.id, 'from phase', fromPhase, 'to phase', toPhase, 'because they have been in phase', fromPhase, 'for', elapsedDays, 'days');
                const transitionEvent = new transitionEvent_1.default();
                transitionEvent.numDays = elapsedDays;
                return transitionEvent;
            }
            return undefined;
        }
        // Get all statistics for the participant after entry into current phase
        const activityRepo = dataSource.getRepository(dailyActivityTime_1.default);
        const activities = yield activityRepo.find({
            where: {
                participantId: participant.id,
                createdAt: (0, typeorm_1.MoreThan)(entryDate),
            },
        });
        log('found', activities.length, 'activities for participant', participant.id, 'after entry date', entryDate, 'into phase', participant.phase);
        return (0, postEvent_1.shouldTriggerPhaseTransition)(setting, activities);
    });
    const transitionEvent = yield getTransition();
    if (transitionEvent) {
        log('triggering transition from phase', fromPhase, 'to phase', toPhase);
        transitionEvent.participantId = participant.id;
        transitionEvent.fromPhase = fromPhase;
        transitionEvent.toPhase = toPhase;
        transitionEvent.reason = transitionEvent_1.TransitionReason.AUTOMATIC;
        transitionEvent.transitionSettingId = setting.id;
        transitionEvent.eventId = latestEvent.id;
        const saveParticipantTransition = (0, participant_1.createSaveParticipantTransition)({
            dataSource,
            notifier: notifier.makeParticipantNotifier({
                participantCode: participant.code,
                participantId: participant.id,
                isPaid: participant.isPaid,
            }),
            log,
        });
        participant.phase = toPhase;
        yield saveParticipantTransition(participant, transitionEvent, latestEvent);
    }
});
exports.createUpdatePhase = createUpdatePhase;
exports.default = exports.createUpdatePhase;
//# sourceMappingURL=updateParticipantPhase.js.map
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
exports.createSaveParticipantTransition = exports.isParticipantRecord = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const util_1 = require("../../common/util");
const transitionEvent_1 = __importStar(require("../models/transitionEvent"));
const transitionSetting_1 = __importDefault(require("../models/transitionSetting"));
const isParticipantRecord = (record) => (0, util_1.has)('code')(record)
    && (0, util_1.has)('arm')(record)
    && typeof record.code === 'string'
    && record.code.length > 0
    && (record.arm === 'control' || record.arm === 'treatment');
exports.isParticipantRecord = isParticipantRecord;
const createSaveParticipantTransition = ({ dataSource, notifier, log, }) => {
    const settingsRepo = dataSource.getRepository(transitionSetting_1.default);
    return (participant, transition, triggerEvent) => __awaiter(void 0, void 0, void 0, function* () {
        log('info', 'transition to save:', transition);
        const { fromPhase, toPhase } = transition;
        const settings = yield settingsRepo.findOne({
            where: {
                isCurrent: true,
                fromPhase,
                toPhase,
            },
        });
        if (!settings && triggerEvent) {
            log('error', `no settings found for transition from ${fromPhase} to ${toPhase}`);
            return undefined;
        }
        try {
            return yield dataSource.transaction('SERIALIZABLE', (entityManager) => __awaiter(void 0, void 0, void 0, function* () {
                const latestTransition = yield entityManager.findOne(transitionEvent_1.default, {
                    where: {
                        participantId: participant.id,
                    },
                    order: {
                        id: 'DESC',
                    },
                });
                if (latestTransition) {
                    log('info', 'latest transition:', latestTransition);
                }
                if ((latestTransition === null || latestTransition === void 0 ? void 0 : latestTransition.fromPhase) === transition.fromPhase && (latestTransition === null || latestTransition === void 0 ? void 0 : latestTransition.toPhase) === transition.toPhase) {
                    log('info', 'transition already saved, not adding another one');
                    return undefined;
                }
                const intermediaryTransition = new transitionEvent_1.default();
                Object.assign(intermediaryTransition, transition, {
                    participantId: participant.id,
                });
                if (triggerEvent) {
                    intermediaryTransition.eventId = triggerEvent.id;
                    intermediaryTransition.reason = transitionEvent_1.TransitionReason.AUTOMATIC;
                    if (!settings) {
                        log('error', 'no settings found for transition, aborting because it is not manual (was triggered by event)', { triggerEvent });
                        throw new Error('no settings found for transition, aborting because it is not manual (was triggered by event)');
                    }
                    intermediaryTransition.transitionSettingId = settings.id;
                }
                else {
                    intermediaryTransition.reason = transitionEvent_1.TransitionReason.FORCED;
                }
                const participantUpdate = {
                    phase: intermediaryTransition.toPhase,
                };
                log('info', 'updating participant phase:', participantUpdate);
                const p = yield entityManager.update(participant_1.default, { id: participant.id }, participantUpdate);
                log('info', 'participant now is:', p);
                log('info', 'saving transition:', intermediaryTransition);
                const t = yield entityManager.save(intermediaryTransition);
                log('info', 'saved transition', t);
                yield notifier.onPhaseChange(transition.createdAt, transition.fromPhase, transition.toPhase);
                log('success', 'completed phase transition!');
                return t;
            }));
        }
        catch (error) {
            log('error', 'error saving transition', error);
        }
        return undefined;
    });
};
exports.createSaveParticipantTransition = createSaveParticipantTransition;
//# sourceMappingURL=participant.js.map
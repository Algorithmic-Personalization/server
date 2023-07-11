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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParticipantDefinition = void 0;
const participant_1 = __importStar(require("../models/participant"));
const event_1 = require("../../common/models/event");
const transitionEvent_1 = __importStar(require("../models/transitionEvent"));
const transitionSetting_1 = require("../models/transitionSetting");
const util_1 = require("../../util");
const updateParticipantPhase = (dataSource, notifier, log) => (participant, fromPhase, toPhase) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (fromPhase === toPhase) {
        return participant;
    }
    const latestTransition = yield dataSource
        .getRepository(transitionEvent_1.default)
        .findOne({
        where: {
            participantId: participant.id,
        },
        order: {
            createdAt: 'DESC',
        },
    });
    const startOfLatestPhase = (_a = latestTransition === null || latestTransition === void 0 ? void 0 : latestTransition.createdAt) !== null && _a !== void 0 ? _a : participant.createdAt;
    if (latestTransition) {
        log('latest transition for participant', latestTransition);
    }
    else {
        log('no previous transition for participant, using is creation date as entry into previous phase', startOfLatestPhase);
    }
    const transition = new transitionEvent_1.default();
    transition.fromPhase = fromPhase;
    transition.toPhase = toPhase;
    transition.participantId = participant.id;
    transition.reason = transitionEvent_1.TransitionReason.FORCED;
    transition.numDays = (0, util_1.daysElapsed)(startOfLatestPhase, new Date());
    try {
        const transition = yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            log('saving transition', transition);
            yield manager.save(transition);
            participant.phase = toPhase;
            yield manager.save(participant);
            return participant;
        }));
        log('success', 'saving transition', transition.id);
        if (toPhase === transitionSetting_1.Phase.EXPERIMENT) {
            void notifier.notifyPhaseChange(transition.createdAt, participant.code, fromPhase, toPhase);
        }
        return transition;
    }
    catch (e) {
        log('error saving transition', e);
        throw e;
    }
});
exports.updateParticipantDefinition = {
    verb: 'put',
    path: '/api/participant/:code',
    makeHandler: ({ createLogger, dataSource, notifier }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received update participant request');
        const { id: _unused, phase, arm } = req.body;
        const { code } = req.params;
        if (!code || typeof code !== 'string') {
            throw new Error('Invalid participant email');
        }
        const participantRepo = dataSource.getRepository(participant_1.default);
        const participantEntity = yield participantRepo.findOneBy({ code });
        if (!participantEntity) {
            throw new Error('Participant with that email does not exist');
        }
        const { phase: previousPhase } = participantEntity;
        if ((0, event_1.isValidExperimentArm)(arm)) {
            participantEntity.arm = arm;
        }
        if (phase && !(0, participant_1.isValidPhase)(phase)) {
            throw new Error('Invalid phase, must be one of: 0, 1, 2');
        }
        if ((0, participant_1.isValidPhase)(phase)) {
            return updateParticipantPhase(dataSource, notifier, log)(participantEntity, previousPhase, phase);
        }
        return participantRepo.save(participantEntity);
    }),
};
exports.default = exports.updateParticipantDefinition;
//# sourceMappingURL=updateParticipant.js.map
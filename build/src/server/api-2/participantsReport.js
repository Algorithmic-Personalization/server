"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
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
exports.reportRoute = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const transitionEvent_1 = __importDefault(require("../models/transitionEvent"));
exports.reportRoute = {
    verb: 'get',
    path: '/api/participants-report',
    makeHandler: ({ dataSource, createLogger }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const log = createLogger(req.requestId);
        log('Received report request');
        const participantsRepo = dataSource.getRepository(participant_1.default);
        const participants = yield participantsRepo.find();
        const transitionsRepo = dataSource.getRepository(transitionEvent_1.default);
        const transitions = yield transitionsRepo.find({
            select: ['participantId', 'updatedAt', 'fromPhase', 'toPhase'],
            order: {
                id: 'ASC',
            },
        });
        const latestTransitionsMap = new Map();
        for (const transition of transitions) {
            const participantTransitions = (_a = latestTransitionsMap.get(transition.participantId)) !== null && _a !== void 0 ? _a : {
                entered_intervention_at: null,
                entered_post_intervention_at: null,
                was_reset_to_pre_intervention_at: null,
            };
            if (transition.toPhase === 1) {
                participantTransitions.entered_intervention_at = transition.updatedAt.getTime();
            }
            else if (transition.toPhase === 2) {
                participantTransitions.entered_post_intervention_at = transition.updatedAt.getTime();
            }
            else if (transition.toPhase === 0) {
                participantTransitions.was_reset_to_pre_intervention_at = transition.updatedAt.getTime();
            }
            latestTransitionsMap.set(transition.participantId, participantTransitions);
        }
        const report = participants.map(participant => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            return ({
                identifier: participant.code,
                phase: participant.phase,
                activated_browser_extension_at: (_b = (_a = participant.extensionActivatedAt) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : null,
                entered_intervention_at: (_d = (_c = latestTransitionsMap.get(participant.id)) === null || _c === void 0 ? void 0 : _c.entered_intervention_at) !== null && _d !== void 0 ? _d : null,
                entered_post_intervention_at: (_f = (_e = latestTransitionsMap.get(participant.id)) === null || _e === void 0 ? void 0 : _e.entered_post_intervention_at) !== null && _f !== void 0 ? _f : null,
                was_reset_to_pre_intervention_at: (_h = (_g = latestTransitionsMap.get(participant.id)) === null || _g === void 0 ? void 0 : _g.was_reset_to_pre_intervention_at) !== null && _h !== void 0 ? _h : null,
            });
        });
        return report;
    }),
};
exports.default = exports.reportRoute;
//# sourceMappingURL=participantsReport.js.map
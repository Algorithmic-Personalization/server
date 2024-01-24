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
exports.createGetParticipantConfigRoute = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const createGetParticipantConfigRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received get participant config request');
    const participantRepo = dataSource.getRepository(participant_1.default);
    const configRepo = dataSource.getRepository(experimentConfig_1.default);
    const config = yield configRepo.findOneBy({
        isCurrent: true,
    });
    if (!config) {
        log('No current config found');
        res.status(500).json({ kind: 'Failure', message: 'No current config found' });
        return;
    }
    const participant = yield participantRepo.findOneBy({
        code: req.participantCode,
    });
    if (!participant) {
        log('No participant found');
        res.status(500).json({ kind: 'Failure', message: 'No participant found' });
        return;
    }
    const { arm } = participant;
    const { nonPersonalizedProbability: configProbability } = config;
    const nonPersonalizedProbability = participant.phase === 1
        ? configProbability
        : 0;
    const result = {
        arm,
        nonPersonalizedProbability,
        experimentConfigId: config.id,
        phase: participant.phase,
    };
    log('Sending participant config', result);
    res.send({ kind: 'Success', value: result });
});
exports.createGetParticipantConfigRoute = createGetParticipantConfigRoute;
exports.default = exports.createGetParticipantConfigRoute;
//# sourceMappingURL=participantConfig.js.map
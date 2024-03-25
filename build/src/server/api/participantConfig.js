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
const channelSourceGetForParticipant_1 = require("../api-2/channelSourceGetForParticipant");
const event_1 = require("../../common/models/event");
const createGetParticipantConfigRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received get participant config request');
    const qr = dataSource.createQueryRunner();
    try {
        yield qr.connect();
        yield qr.startTransaction();
        const participantRepo = qr.manager.getRepository(participant_1.default);
        const configRepo = qr.manager.getRepository(experimentConfig_1.default);
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
        const channelSource = participant.arm === event_1.ExperimentArm.TREATMENT
            ? yield (0, channelSourceGetForParticipant_1.updateIfNeededAndGetParticipantChannelSource)(qr, log)(participant)
            : { channelId: undefined, pos: undefined };
        if (qr.isTransactionActive) {
            yield qr.commitTransaction();
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
            channelSource: channelSource.channelId,
            pos: channelSource.pos,
        };
        log('Sending participant config', result);
        res.send({ kind: 'Success', value: result });
    }
    catch (e) {
        if (qr.isTransactionActive) {
            yield qr.rollbackTransaction();
        }
        log('error', 'Failed to get participant config', e);
        res.status(500).json({ kind: 'Failure', message: 'Failed to get participant config' });
    }
    finally {
        yield qr.release();
    }
});
exports.createGetParticipantConfigRoute = createGetParticipantConfigRoute;
exports.default = exports.createGetParticipantConfigRoute;
//# sourceMappingURL=participantConfig.js.map
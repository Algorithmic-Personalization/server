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
exports.createUploadParticipantsRoute = void 0;
const csv_1 = require("../lib/csv");
const participant_1 = __importDefault(require("../models/participant"));
const transitionEvent_1 = __importStar(require("../models/transitionEvent"));
const event_1 = require("../../common/models/event");
const participant_2 = require("../lib/participant");
const createUploadParticipantsRoute = ({ createLogger, dataSource, notifier }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const log = createLogger(req.requestId);
    log('Received upload participants request');
    const handlePhaseUpdate = (record) => __awaiter(void 0, void 0, void 0, function* () {
        const { code, phase } = record;
        if (!phase) {
            return false;
        }
        if (typeof code !== 'string') {
            throw new Error('invalid participant code, must be a string');
        }
        const nPhase = Number(phase);
        if (nPhase < 0 || nPhase > 2) {
            throw new Error('invalid phase, must be one of: 0, 1, 2');
        }
        const p = yield dataSource.getRepository(participant_1.default).findOneOrFail({
            where: {
                code,
            },
        });
        if (p.phase === nPhase) {
            return false;
        }
        const transition = new transitionEvent_1.default();
        transition.fromPhase = p.phase;
        transition.toPhase = nPhase;
        transition.participantId = p.id;
        transition.reason = transitionEvent_1.TransitionReason.FORCED;
        const saveTransition = (0, participant_2.createSaveParticipantTransition)({
            dataSource,
            log,
            notifier: notifier.makeParticipantNotifier({
                participantCode: p.code,
                participantId: p.id,
                isPaid: p.isPaid,
            }),
        });
        yield saveTransition(p, transition, undefined);
        return true;
    });
    const participants = (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.buffer.toString('utf-8');
    if (!participants) {
        log('no participants received');
        res.status(400).json({ kind: 'Failure', message: 'No participants file' });
        return;
    }
    const participantRepo = dataSource.getRepository(participant_1.default);
    let nUpdated = 0;
    let nCreated = 0;
    let line = 1;
    const errorLines = [];
    const reply = () => {
        const messages = [];
        if (errorLines.length > 0) {
            messages.push(`Some records are invalid (${errorLines.length} total), at lines: ${errorLines.slice(0, 10).join(', ')}...`);
        }
        messages.push(`Created ${nCreated} new participants.`);
        messages.push(`Updated ${nUpdated} existing participants.`);
        const message = messages.join(' ');
        log('sending reply:', message);
        res.status(200).json({ kind: 'Success', value: message });
    };
    try {
        const records = yield (0, csv_1.parse)(participants);
        for (const record of records) {
            line += 1;
            if (!(0, participant_2.isParticipantRecord)(record)) {
                log('invalid record:', record);
                errorLines.push(line);
                continue;
            }
            const participant = new participant_1.default();
            participant.code = record.code;
            participant.arm = record.arm === 'control' ? event_1.ExperimentArm.CONTROL : event_1.ExperimentArm.TREATMENT;
            participant.isPaid = record.isPaid === 1 || record.isPaid === '1';
            const existingParticipant = yield participantRepo.findOneBy({ code: participant.code });
            if (existingParticipant) {
                let updated = false;
                if (existingParticipant.arm !== participant.arm) {
                    existingParticipant.arm = participant.arm;
                    existingParticipant.updatedAt = new Date();
                    // eslint-disable-next-line max-depth
                    try {
                        yield participantRepo.save(existingParticipant);
                        nUpdated += 1;
                        updated = true;
                    }
                    catch (err) {
                        log('failed to update participant:', err);
                        errorLines.push(line);
                        continue;
                    }
                }
                if (yield handlePhaseUpdate(record)) {
                    updated || (updated = true);
                }
                if (updated) {
                    nUpdated += 1;
                }
            }
            else {
                yield participantRepo.save(participant);
                yield handlePhaseUpdate(record);
                nCreated += 1;
            }
        }
        reply();
    }
    catch (err) {
        log('failed to parse participants:', err);
        res.status(400).json({ kind: 'Failure', message: 'Failed to parse participants' });
    }
});
exports.createUploadParticipantsRoute = createUploadParticipantsRoute;
exports.default = exports.createUploadParticipantsRoute;
//# sourceMappingURL=uploadParticipants.js.map
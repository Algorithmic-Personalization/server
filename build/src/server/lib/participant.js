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
exports.createSaveParticipantTransition = exports.isParticipantRecord = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const util_1 = require("../../common/util");
const transitionEvent_1 = __importDefault(require("../models/transitionEvent"));
const isParticipantRecord = (record) => (0, util_1.has)('code')(record)
    && (0, util_1.has)('arm')(record)
    && typeof record.code === 'string'
    && record.code.length > 0
    && (record.arm === 'control' || record.arm === 'treatment');
exports.isParticipantRecord = isParticipantRecord;
const createSaveParticipantTransition = ({ dataSource, notifier, log, }) => (participant, transition, triggerEvent) => __awaiter(void 0, void 0, void 0, function* () {
    const qr = dataSource.createQueryRunner();
    const proceedToUpdate = () => __awaiter(void 0, void 0, void 0, function* () {
        log('info', 'saving transition event...');
        const updatedTransition = new transitionEvent_1.default();
        Object.assign(updatedTransition, transition, {
            eventId: triggerEvent ? triggerEvent.id : undefined,
            participantId: participant.id,
        });
        const updatedParticipant = new participant_1.default();
        Object.assign(updatedParticipant, participant, {
            phase: transition.toPhase,
        });
        const [, savedTransitionEvent] = yield Promise.all([
            qr.manager.save(updatedParticipant),
            qr.manager.save(updatedTransition),
        ]);
        yield qr.commitTransaction();
        yield notifier.onPhaseChange(transition.createdAt, transition.fromPhase, transition.toPhase);
        return savedTransitionEvent;
    });
    try {
        yield qr.startTransaction('SERIALIZABLE');
        const repo = qr.manager.getRepository(transitionEvent_1.default);
        const latestExistingTransition = yield repo
            .createQueryBuilder()
            .useTransaction(true)
            .setLock('pessimistic_write_or_fail')
            .where({
            participantId: participant.id,
        })
            .orderBy({
            id: 'DESC',
        })
            .getOne();
        if (latestExistingTransition) {
            if (latestExistingTransition.fromPhase === transition.fromPhase
                && latestExistingTransition.toPhase === transition.toPhase) {
                log('info', 'transition already exists, skipping');
                // No need to update
                return;
            }
        }
        const p = yield proceedToUpdate();
        yield qr.commitTransaction();
        log('success', 'transition from', transition.fromPhase, 'to', transition.toPhase, 'saved');
        return p;
    }
    catch (error) {
        if (qr.isTransactionActive) {
            yield qr.rollbackTransaction();
        }
        log('error', 'while saving transition event', error);
        return undefined;
    }
    finally {
        yield qr.release();
    }
});
exports.createSaveParticipantTransition = createSaveParticipantTransition;
//# sourceMappingURL=participant.js.map
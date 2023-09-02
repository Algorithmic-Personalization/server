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
exports.createActivateExtension = void 0;
const participant_1 = __importDefault(require("../../models/participant"));
const event_1 = __importDefault(require("../../../common/models/event"));
const event_2 = require("../../../common/models/event");
const createActivateExtension = ({ dataSource, activityNotifier, log, }) => (event, participant) => __awaiter(void 0, void 0, void 0, function* () {
    const qr = dataSource.createQueryRunner();
    try {
        yield qr.startTransaction();
        const repo = qr.manager.getRepository(participant_1.default);
        const p = yield repo
            .createQueryBuilder('participant')
            .useTransaction(true)
            .setLock('pessimistic_read')
            .where({ id: participant.id })
            .getOne();
        if (p === null) {
            throw new Error('Participant not found');
        }
        if (p.extensionActivatedAt !== null) {
            log('info', `Participant ${participant.id} already activated extension`);
            return false;
        }
        const activationEvent = new event_1.default();
        Object.assign(activationEvent, event, {
            type: event_2.EventType.EXTENSION_ACTIVATED,
            id: 0,
            localUuid: activationEvent.localUuid,
        });
        p.extensionActivatedAt = new Date();
        const [savedEvent] = yield Promise.all([
            qr.manager.save(activationEvent),
            qr.manager.save(p),
        ]);
        yield qr.commitTransaction();
        log('success', `Participant ${participant.id} activated extension, the following event was saved:`, savedEvent);
        yield activityNotifier.onActive(activationEvent.createdAt);
        return true;
    }
    catch (err) {
        log('error', 'while handling extension activity status determination or saving:', err);
        yield qr.rollbackTransaction();
        return false;
    }
    finally {
        log('debug', 'releasing query runner');
        yield qr.release();
    }
});
exports.createActivateExtension = createActivateExtension;
//# sourceMappingURL=createActivateExtension.js.map
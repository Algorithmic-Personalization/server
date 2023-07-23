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
exports.createHandleExtensionInstalledEvent = void 0;
const participant_1 = __importDefault(require("../../models/participant"));
const event_1 = __importDefault(require("../../../common/models/event"));
const createHandleExtensionInstalledEvent = ({ dataSource, notifier, log, }) => (p, event) => __awaiter(void 0, void 0, void 0, function* () {
    log('handling extension installed event...');
    if (p.extensionInstalled) {
        log('info', 'participant extension already installed, skipping with no lookup');
        return;
    }
    log('info', 'initiating the transaction business...');
    const queryRunner = dataSource.createQueryRunner();
    try {
        yield queryRunner.startTransaction();
        const participantRepo = queryRunner.manager.getRepository(participant_1.default);
        const participant = yield participantRepo
            .createQueryBuilder('participant')
            .useTransaction(true)
            .setLock('pessimistic_read')
            .where({ id: p.id })
            .getOne();
        if (!participant) {
            throw new Error('Participant not found');
        }
        if (participant.extensionInstalled) {
            log('info', 'participant extension already installed, skipping');
        }
        else {
            log('info', 'participant extension not installed, calling API to notify installation...');
            log('remote server notified, updating local participant...');
            participant.extensionInstalled = true;
            yield queryRunner.manager.save(participant);
            const eventRepo = queryRunner.manager.getRepository(event_1.default);
            const e = yield eventRepo.save(event);
            log('event saved', e);
            yield queryRunner.commitTransaction();
            log('participant updated, transaction committed');
            yield notifier.notifyInstalled(event.createdAt);
        }
    }
    catch (err) {
        log('error', 'handling EXTENSION_INSTALLED event', err);
        yield queryRunner.rollbackTransaction();
    }
    finally {
        yield queryRunner.release();
    }
});
exports.createHandleExtensionInstalledEvent = createHandleExtensionInstalledEvent;
exports.default = exports.createHandleExtensionInstalledEvent;
//# sourceMappingURL=handleExtensionInstalledEvent.js.map
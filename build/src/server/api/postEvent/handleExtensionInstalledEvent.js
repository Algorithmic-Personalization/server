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
exports.createHandleExtensionInstalledEvent = void 0;
const participant_1 = __importDefault(require("../../models/participant"));
const event_1 = __importStar(require("../../../common/models/event"));
const createHandleExtensionInstalledEvent = ({ dataSource, notifier, log, }) => (p, triggerEvent) => __awaiter(void 0, void 0, void 0, function* () {
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
            .setLock('pessimistic_write_or_fail')
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
            const installEvent = new event_1.default();
            const eventRepo = queryRunner.manager.getRepository(event_1.default);
            Object.assign(installEvent, triggerEvent, {
                type: event_1.EventType.EXTENSION_INSTALLED,
                localUuid: installEvent.localUuid,
                id: 0,
            });
            yield eventRepo.save(installEvent);
            yield queryRunner.manager.save(participant);
            yield queryRunner.commitTransaction();
            log('participant updated, transaction committed');
            yield notifier.onInstalled(triggerEvent.createdAt);
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
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
const db_1 = __importDefault(require("../server/tests-util/db"));
const handleExtensionInstalledEvent_1 = __importDefault(require("../server/api/postEvent/handleExtensionInstalledEvent"));
const createMockParticipantActivityNotifier_1 = __importDefault(require("../server/tests-util/createMockParticipantActivityNotifier"));
describe('installExtension', () => {
    let db;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        db = yield (0, db_1.default)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.tearDown();
    }));
    it('should notify the remote server of the installation', () => __awaiter(void 0, void 0, void 0, function* () {
        const notifier = (0, createMockParticipantActivityNotifier_1.default)();
        const handleInstallEvent = (0, handleExtensionInstalledEvent_1.default)({
            dataSource: db.dataSource,
            notifier,
            log: jest.fn(),
        });
        const participant = yield db.createParticipant();
        const session = yield db.createSession(participant);
        const event = yield db.createEvent(session);
        yield handleInstallEvent(participant, event);
        expect(notifier.onInstalled).toHaveBeenCalledTimes(1);
    }));
    it('should not notify the remote server of the installation if already installed', () => __awaiter(void 0, void 0, void 0, function* () {
        const notifier = (0, createMockParticipantActivityNotifier_1.default)();
        const handleInstallEvent = (0, handleExtensionInstalledEvent_1.default)({
            dataSource: db.dataSource,
            notifier,
            log: jest.fn(),
        });
        const participant = yield db.createParticipant();
        const session = yield db.createSession(participant);
        const event = yield db.createEvent(session);
        yield handleInstallEvent(participant, event);
        const installAttempts = [];
        for (let i = 0; i < 15; ++i) {
            const installAttempt = handleInstallEvent(participant, event);
            installAttempts.push(installAttempt);
        }
        yield Promise.allSettled(installAttempts);
        expect(notifier.onInstalled).toHaveBeenCalledTimes(1);
    }), 30000);
});
//# sourceMappingURL=installExtension.test.js.map
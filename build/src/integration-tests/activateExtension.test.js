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
const createActivateExtension_1 = require("../server/api/postEvent/createActivateExtension");
const createMockParticipantActivityNotifier_1 = require("../server/tests-util/createMockParticipantActivityNotifier");
describe('activateExtension', () => {
    let db;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        db = yield (0, db_1.default)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.tearDown();
    }));
    it('should activate the extension for a participant', () => __awaiter(void 0, void 0, void 0, function* () {
        const participant = yield db.createParticipant();
        const session = yield db.createSession(participant);
        const event = yield db.createEvent(session);
        const activityNotifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
        const activateExtension = (0, createActivateExtension_1.createActivateExtension)({
            dataSource: db.dataSource,
            activityNotifier,
            log: jest.fn(),
        });
        yield activateExtension(event, participant);
        expect(activityNotifier.notifyActive).toHaveBeenCalledTimes(1);
    }));
    it('should activate the extension only once for a participant', () => __awaiter(void 0, void 0, void 0, function* () {
        const activityNotifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
        const participant = yield db.createParticipant();
        const session = yield db.createSession(participant);
        const activateExtension = (0, createActivateExtension_1.createActivateExtension)({
            dataSource: db.dataSource,
            activityNotifier,
            log: jest.fn(),
        });
        const activationRequests = [];
        for (let i = 0; i < 15; ++i) {
            const activationPromise = db.createEvent(session).then((event) => __awaiter(void 0, void 0, void 0, function* () { return activateExtension(event, participant); }));
            activationRequests.push(activationPromise);
        }
        yield Promise.allSettled(activationRequests);
        expect(activityNotifier.notifyActive).toHaveBeenCalledTimes(1);
    }), 30000);
});
//# sourceMappingURL=activateExtension.test.js.map
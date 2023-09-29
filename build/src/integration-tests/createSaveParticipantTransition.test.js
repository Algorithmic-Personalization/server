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
const participant_1 = require("../server/lib/participant");
const createMockParticipantActivityNotifier_1 = require("../server/tests-util/createMockParticipantActivityNotifier");
const participant_2 = __importDefault(require("../server/models/participant"));
const transitionEvent_1 = require("../server/models/transitionEvent");
describe('updateParticipantPhase', () => {
    let db;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        db = yield (0, db_1.default)();
        yield db.createTransitionSettings();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.tearDown();
    }));
    it('should make a participant transition phases', () => __awaiter(void 0, void 0, void 0, function* () {
        const notifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
        const saveTransition = (0, participant_1.createSaveParticipantTransition)({
            dataSource: db.dataSource,
            notifier,
            log: console.log,
        });
        const participant = yield db.createParticipant();
        const transition = db.createTransitionEvent(participant);
        yield saveTransition(participant, transition, undefined);
        expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
        const updatedParticipant = yield db.dataSource.getRepository(participant_2.default).findOneOrFail({
            where: {
                id: participant.id,
            },
        });
        expect(updatedParticipant.phase).toBe(transition.toPhase);
    }));
    it('should transition a user with an attached event', () => __awaiter(void 0, void 0, void 0, function* () {
        const participant = yield db.createParticipant();
        const transition = db.createTransitionEvent(participant);
        transition.reason = transitionEvent_1.TransitionReason.AUTOMATIC;
        const session = yield db.createSession(participant);
        const triggerEvent = yield db.createEvent(session);
        const notifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
        const saveTransition = (0, participant_1.createSaveParticipantTransition)({
            dataSource: db.dataSource,
            notifier,
            log: console.log,
        });
        const t = yield saveTransition(participant, transition, triggerEvent);
        expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
        expect(t).toBeDefined();
        expect(t === null || t === void 0 ? void 0 : t.id).toBeGreaterThan(0);
    }));
    it('should not save the transition more than once for the same participant and the same transition', () => __awaiter(void 0, void 0, void 0, function* () {
        const flaky = () => __awaiter(void 0, void 0, void 0, function* () {
            const notifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
            const saveTransition = (0, participant_1.createSaveParticipantTransition)({
                dataSource: db.dataSource,
                notifier,
                log: jest.fn(),
            });
            const participant = yield db.createParticipant();
            const nParallel = 10;
            const transitions = Array.from({ length: nParallel }, () => db.createTransitionEvent(participant));
            yield Promise.allSettled(transitions.map((transition) => __awaiter(void 0, void 0, void 0, function* () { return saveTransition(participant, transition, undefined); })));
            expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
        });
        for (let i = 0; i < 10; ++i) {
            // eslint-disable-next-line no-await-in-loop
            yield flaky();
        }
    }));
});
//# sourceMappingURL=createSaveParticipantTransition.test.js.map
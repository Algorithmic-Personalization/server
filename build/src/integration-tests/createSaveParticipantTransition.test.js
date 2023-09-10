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
describe('updateParticipantPhase', () => {
    let db;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        db = yield (0, db_1.default)();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.tearDown();
    }));
    it('should make a participant transition phases', () => __awaiter(void 0, void 0, void 0, function* () {
        const notifier = (0, createMockParticipantActivityNotifier_1.createMockParticipantActivityNotifier)();
        const saveTransition = (0, participant_1.createSaveParticipantTransition)({
            dataSource: db.dataSource,
            notifier,
            log: jest.fn(),
        });
        const participant = yield db.createParticipant();
        const transition = db.createTransitionEvent(participant);
        yield saveTransition(participant, transition, undefined);
        expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
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
            yield Promise.all(transitions.map((transition) => __awaiter(void 0, void 0, void 0, function* () { return saveTransition(participant, transition, undefined); })));
            expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
        });
        for (let i = 0; i < 10; ++i) {
            // eslint-disable-next-line no-await-in-loop
            yield flaky();
        }
    }));
});
//# sourceMappingURL=createSaveParticipantTransition.test.js.map
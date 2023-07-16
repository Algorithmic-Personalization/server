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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSaveParticipantTransition = exports.isParticipantRecord = void 0;
const util_1 = require("../../common/util");
const isParticipantRecord = (record) => (0, util_1.has)('code')(record)
    && (0, util_1.has)('arm')(record)
    && typeof record.code === 'string'
    && record.code.length > 0
    && (record.arm === 'control' || record.arm === 'treatment');
exports.isParticipantRecord = isParticipantRecord;
const createSaveParticipantTransition = ({ dataSource, notifier, }) => (participant, transition) => __awaiter(void 0, void 0, void 0, function* () {
    return dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
        participant.phase = transition.toPhase;
        const [updatedParticipant] = yield Promise.all([
            manager.save(participant),
            manager.save(transition),
        ]);
        yield notifier.notifyPhaseChange(transition.createdAt, transition.fromPhase, transition.toPhase);
        return updatedParticipant;
    }));
});
exports.createSaveParticipantTransition = createSaveParticipantTransition;
//# sourceMappingURL=participant.js.map
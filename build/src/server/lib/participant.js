"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isParticipantRecord = void 0;
var util_1 = require("../../common/util");
var isParticipantRecord = function (record) {
    return (0, util_1.has)('code')(record)
        && (0, util_1.has)('arm')(record)
        && typeof record.code === 'string'
        && record.code.length > 0
        && (record.arm === 'control' || record.arm === 'treatment');
};
exports.isParticipantRecord = isParticipantRecord;
//# sourceMappingURL=participant.js.map
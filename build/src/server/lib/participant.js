"use strict";
exports.__esModule = true;
exports.isParticipantRecord = void 0;
var util_1 = require("../../common/util");
var isParticipantRecord = function (record) {
    return (0, util_1.has)('email')(record)
        && (0, util_1.has)('code')(record)
        && (0, util_1.has)('arm')(record)
        && typeof record.email === 'string'
        && typeof record.code === 'string'
        && record.email.length > 0
        && record.code.length > 0
        && (record.arm === 'control' || record.arm === 'treatment');
};
exports.isParticipantRecord = isParticipantRecord;

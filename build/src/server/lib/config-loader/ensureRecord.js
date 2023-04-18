"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRecord = void 0;
const ensureRecord = (x) => {
    if (typeof x !== 'object' || x === null) {
        throw new Error('Expected object');
    }
    return true;
};
exports.ensureRecord = ensureRecord;
exports.default = exports.ensureRecord;
//# sourceMappingURL=ensureRecord.js.map
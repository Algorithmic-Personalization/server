"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreateDefaultLogger = void 0;
const util_1 = require("util");
const makeCreateDefaultLogger = (f) => (requestIdOrId) => (...args) => {
    const id = typeof requestIdOrId === 'number' ? `request #${requestIdOrId}` : requestIdOrId;
    const parts = [`\x1b[94m[${id} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
            if (typeof arg === 'string' && i === 0) {
                return arg.toLowerCase();
            }
            if (typeof arg === 'string') {
                return arg;
            }
            return (0, util_1.inspect)(arg, { depth: null, colors: true });
        })];
    console.log(...parts);
    f.write(`${parts.join(' ')}\n`);
};
exports.makeCreateDefaultLogger = makeCreateDefaultLogger;
exports.default = exports.makeCreateDefaultLogger;
//# sourceMappingURL=logger.js.map
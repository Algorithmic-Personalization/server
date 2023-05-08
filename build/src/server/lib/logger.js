"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCreateDefaultLogger = void 0;
const util_1 = require("util");
const red = (str) => `\x1b[31m${str}\x1b[0m`;
const green = (str) => `\x1b[32m${str}\x1b[0m`;
const orange = (str) => `\x1b[33m${str}\x1b[0m`;
const blue = (str) => `\x1b[34m${str}\x1b[0m`;
const makeCreateDefaultLogger = (prettyStream) => (requestIdOrId) => (...args) => {
    const id = typeof requestIdOrId === 'number' ? `request #${requestIdOrId}` : requestIdOrId;
    const parts = [`\x1b[94m[${id} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
            if (typeof arg === 'string' && i === 0) {
                const str = arg.toLowerCase();
                if (str === 'error' || str.startsWith('fail')) {
                    return red(str);
                }
                if (str === 'warning') {
                    return orange(str);
                }
                if (str === 'success') {
                    return green(str);
                }
                if (str === 'info') {
                    return blue(str);
                }
                return str;
            }
            if (typeof arg === 'string') {
                return arg;
            }
            return (0, util_1.inspect)(arg, { depth: null, colors: true });
        })];
    console.log(...parts);
    prettyStream.write(`${parts.join(' ')}\n`);
};
exports.makeCreateDefaultLogger = makeCreateDefaultLogger;
exports.default = exports.makeCreateDefaultLogger;
//# sourceMappingURL=logger.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = void 0;
const attrs = (attributes) => {
    if (!attributes) {
        return '';
    }
    const list = Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(' ');
    return ` ${list}`;
};
const t = (tag, attributes) => (...body) => `<${tag} ${attrs(attributes)}>${body.join(' ')}</${tag}>`;
exports.t = t;
exports.default = exports.t;
//# sourceMappingURL=htmlGen.js.map
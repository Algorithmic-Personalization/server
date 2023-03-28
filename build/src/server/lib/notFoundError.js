"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.code = 404;
    }
}
exports.NotFoundError = NotFoundError;
exports.default = NotFoundError;
//# sourceMappingURL=notFoundError.js.map
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
exports.createAuthMiddleWare = void 0;
const createAuthMiddleWare = ({ createLogger, tokenTools, tokenRepo }) => (req, res, next) => {
    const log = createLogger(req.requestId);
    const token = req.headers.authorization;
    log('Checking token:', token);
    if (!token) {
        log('Missing authorization header');
        res.status(401).json({ kind: 'Failure', message: 'Missing authorization header', code: 'NOT_AUTHENTICATED' });
        return;
    }
    log('Verifying token');
    const check = tokenTools.verify(token);
    if (check.kind === 'Failure') {
        log('Invalid token');
        res.status(401).json({ kind: 'Failure', message: 'Invalid token', code: 'NOT_AUTHENTICATED' });
        return;
    }
    log('Checking token in the database');
    (() => __awaiter(void 0, void 0, void 0, function* () {
        const tokenEntity = yield tokenRepo.findOneBy({ token });
        if (!tokenEntity) {
            log('Token not in the database');
            res.status(401).json({ kind: 'Failure', message: 'Token not in the database', code: 'NOT_AUTHENTICATED' });
            return;
        }
        if (tokenEntity.wasInvalidated) {
            log('Token was invalidated');
            res.status(401).json({ kind: 'Failure', message: 'Token was invalidated', code: 'NOT_AUTHENTICATED' });
            return;
        }
        log('Token is valid');
        req.adminId = tokenEntity.adminId;
        next();
    }))();
};
exports.createAuthMiddleWare = createAuthMiddleWare;
exports.default = exports.createAuthMiddleWare;
//# sourceMappingURL=authMiddleware.js.map
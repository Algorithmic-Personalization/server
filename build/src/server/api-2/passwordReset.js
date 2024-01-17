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
exports.resetPassword = void 0;
const admin_1 = __importDefault(require("../../common/models/admin"));
const resetPasswordToken_1 = __importDefault(require("../models/resetPasswordToken"));
const crypto_1 = require("../lib/crypto");
const serverRoutes_1 = require("../serverRoutes");
exports.resetPassword = {
    verb: 'post',
    path: serverRoutes_1.resetPasswordPath,
    makeHandler: ({ createLogger, dataSource, }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'received admin password update request');
        const { email, password, token: tokenString } = req.body;
        if (!email || typeof email !== 'string') {
            log('error', 'missing e-mail');
            return false;
        }
        if (!password || typeof password !== 'string') {
            log('error', 'missing password');
            return false;
        }
        if (!tokenString || typeof tokenString !== 'string') {
            log('error', 'missing token');
            return false;
        }
        const adminRepo = dataSource.getRepository(admin_1.default);
        const admin = yield adminRepo.findOneBy({ email });
        if (!admin) {
            log('error', 'could not find admin by', { email });
            return false;
        }
        const resetTokenRepo = dataSource.getRepository(resetPasswordToken_1.default);
        const token = yield resetTokenRepo.findOneBy({ token: tokenString });
        if (!token) {
            log('error', 'token not found');
            return false;
        }
        if (token.adminId !== admin.id) {
            log('error', 'token is not assigned to this admin', { tokenAdmin: token.adminId, emailAdmin: admin.id });
            return false;
        }
        if (token.validUntil < new Date()) {
            log('error', 'token is expired');
            return false;
        }
        if (token.usedAt) {
            log('error', 'token is already used');
            return false;
        }
        token.usedAt = new Date();
        admin.password = yield (0, crypto_1.hashPassword)(password);
        yield dataSource.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
            return Promise.all([
                trx.save(admin),
                trx.save(token),
            ]);
        }));
        log('success', 'password updated successfully for', { email });
        return true;
    }),
};
exports.default = exports.resetPassword;
//# sourceMappingURL=passwordReset.js.map
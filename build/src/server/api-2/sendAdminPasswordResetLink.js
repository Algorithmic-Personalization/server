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
exports.sendAdminPasswordResetLink = void 0;
const admin_1 = __importDefault(require("../../common/models/admin"));
const resetPasswordToken_1 = __importDefault(require("../models/resetPasswordToken"));
const crypto_1 = require("../lib/crypto");
const serverRoutes_1 = require("../serverRoutes");
const serverUrl_1 = require("../lib/config-loader/serverUrl");
const htmlGen_1 = require("../lib/htmlGen");
const ms24h = 1000 * 60 * 60 * 24;
const tokenValidityMs = ms24h;
exports.sendAdminPasswordResetLink = {
    verb: 'post',
    path: serverRoutes_1.sendResetLinkPath,
    makeHandler: ({ createLogger, dataSource, mailer, }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'received admin reset password request');
        const { email } = req.body;
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required.');
        }
        const adminRepo = dataSource.getRepository(admin_1.default);
        const admin = yield adminRepo.findOneBy({ email });
        if (!admin) {
            return;
        }
        if (!admin.emailVerified) {
            return;
        }
        const token = new resetPasswordToken_1.default();
        token.adminId = admin.id;
        token.token = (0, crypto_1.randomToken)(64);
        token.usedAt = undefined;
        token.validUntil = new Date(Date.now() + tokenValidityMs);
        const resetTokenRepo = dataSource.getRepository(resetPasswordToken_1.default);
        yield resetTokenRepo.save(token);
        const subject = `Reset your password for: ${new URL(serverUrl_1.serverUrl).hostname}`;
        const url = `${serverUrl_1.serverUrl}/reset-password/${token.token}`;
        const text = `Please visit (copy paste in browser URL bar) the following link to reset your password: \n\n${url}  \n\nIt will expire in 24 hours.`;
        const html = (0, htmlGen_1.t)('div')((0, htmlGen_1.t)('p')('Please click on', (0, htmlGen_1.t)('a', { href: url })('this link'), 'to set a new password.'), (0, htmlGen_1.t)('p')(`The link will expire in ${Math.floor(tokenValidityMs / 1000 / 60 / 60)} hours.`));
        yield mailer({
            to: email,
            subject,
            text,
            html,
        });
        log('success', 'reset password info sent:', { email, subject, text });
    }),
};
exports.default = exports.sendAdminPasswordResetLink;
//# sourceMappingURL=sendAdminPasswordResetLink.js.map
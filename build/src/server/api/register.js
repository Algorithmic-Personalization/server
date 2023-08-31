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
exports.createRegisterRoute = void 0;
const admin_1 = __importDefault(require("../../common/models/admin"));
const util_1 = require("../../common/util");
const serverRoutes_1 = require("../serverRoutes");
const crypto_1 = require("../lib/crypto");
const adminsWhitelist_1 = __importDefault(require("../../../adminsWhitelist"));
const serverUrl_1 = require("../lib/config-loader/serverUrl");
const createRegisterRoute = ({ dataSource, mailer, createLogger }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    const admin = new admin_1.default();
    Object.assign(admin, req.body);
    admin.createdAt = new Date();
    admin.updatedAt = new Date();
    admin.password = yield (0, crypto_1.hashPassword)(admin.password);
    log('Received admin for registration (password is hashed):', admin);
    const errors = yield (0, util_1.validateExcept)('id', 'verificationToken')(admin);
    if (errors.length > 0) {
        const err = {
            kind: 'Failure',
            message: `Invalid entity received from client: ${errors.join(', ')}`,
        };
        res.status(400).json(err);
        return;
    }
    if (!adminsWhitelist_1.default.has(admin.email)) {
        const err = {
            kind: 'Failure',
            message: 'Email not whitelisted',
        };
        res.status(403).json(err);
        return;
    }
    const repo = dataSource.getRepository(admin_1.default);
    const existing = yield repo.findOneBy({ email: admin.email });
    if (existing) {
        res.status(400).json({
            kind: 'Failure',
            message: 'Email already registered',
        });
        return;
    }
    const token = (0, crypto_1.randomToken)();
    admin.verificationToken = token;
    try {
        yield repo.save(admin);
    }
    catch (e) {
        res.status(500).json({
            kind: 'Failure',
            message: (0, util_1.getMessage)(e, 'Unknown database error'),
        });
        return;
    }
    const link = `${serverUrl_1.serverUrl}${serverRoutes_1.getVerifyEmailToken}?token=${token}`;
    try {
        const ok = yield mailer({
            to: admin.email,
            subject: 'Please verify your email address for YTDNPL admin',
            text: `Please paste the following link in your browser to verify your email address: ${link}`,
            html: `Please click <a href="${link}">here</a> to verify your email address.`,
        });
        if (ok) {
            log('success', 'e-mail sent', 'subject, subject');
        }
        res.status(200).json({
            kind: 'Success',
            value: 'Admin registered, please validate your account by clicking the link in the email you should receive shortly. Please check your spam folder if you don\'t see it in your inbox.',
        });
    }
    catch (e) {
        res.status(500).json({
            kind: 'Failure',
            message: (0, util_1.getMessage)(e, 'Unknown mailer error'),
        });
    }
});
exports.createRegisterRoute = createRegisterRoute;
exports.default = exports.createRegisterRoute;
//# sourceMappingURL=register.js.map
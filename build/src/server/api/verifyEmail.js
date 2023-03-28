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
exports.createVerifyEmailRoute = void 0;
const urlencode_1 = require("urlencode");
const admin_1 = __importDefault(require("../../common/models/admin"));
const createVerifyEmailRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        res.status(400).send('Missing token');
        return;
    }
    log('Received verify email verification token:', token);
    const adminRepo = dataSource.getRepository(admin_1.default);
    const admin = yield adminRepo.findOneBy({ verificationToken: token });
    if (!admin) {
        res.status(404).send('User not found');
        return;
    }
    admin.updatedAt = new Date();
    admin.emailVerified = true;
    try {
        yield adminRepo.save(admin);
    }
    catch (err) {
        log('Failed to save admin:', err);
        res.status(500).send('Failed to save admin');
        return;
    }
    res.redirect(`/login?message=${(0, urlencode_1.encode)('Email verified, please log in!')}`);
});
exports.createVerifyEmailRoute = createVerifyEmailRoute;
exports.default = exports.createVerifyEmailRoute;
//# sourceMappingURL=verifyEmail.js.map
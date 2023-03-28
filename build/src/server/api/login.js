"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.createLoginRoute = exports.LoginResponse = void 0;
const class_validator_1 = require("class-validator");
const admin_1 = __importDefault(require("../../common/models/admin"));
const token_1 = __importDefault(require("../models/token"));
const crypto_1 = require("../lib/crypto");
class LoginResponse {
    constructor(admin, token) {
        this.admin = admin;
        this.token = token;
    }
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", admin_1.default)
], LoginResponse.prototype, "admin", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", token_1.default)
], LoginResponse.prototype, "token", void 0);
exports.LoginResponse = LoginResponse;
const createLoginRoute = ({ createLogger, dataSource, tokenTools }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received login request:', req.body.email);
    const { email, password } = req.body;
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ kind: 'Failure', message: 'Missing or invalid email or password' });
        return;
    }
    const adminRepo = dataSource.getRepository(admin_1.default);
    const admin = yield adminRepo.findOneBy({
        email,
    });
    if (!admin) {
        res.status(401).json({ kind: 'Failure', message: 'Invalid email or password' });
        return;
    }
    if (!(yield (0, crypto_1.checkPassword)(password, admin.password))) {
        res.status(401).json({ kind: 'Failure', message: 'Invalid email or password' });
        return;
    }
    const token = new token_1.default();
    token.token = tokenTools.sign('1h', admin.id);
    token.adminId = admin.id;
    const tokenRepo = dataSource.getRepository(token_1.default);
    try {
        yield tokenRepo.save(token);
    }
    catch (err) {
        log('Failed to save token:', err);
        res.status(500).json({ kind: 'Failure', message: 'Failed to save token' });
        return;
    }
    res.json({
        kind: 'Success',
        value: new LoginResponse(admin, token),
    });
});
exports.createLoginRoute = createLoginRoute;
exports.default = exports.createLoginRoute;
//# sourceMappingURL=login.js.map
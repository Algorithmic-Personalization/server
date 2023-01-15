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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createLoginRoute = exports.LoginResponse = void 0;
var class_validator_1 = require("class-validator");
var admin_1 = __importDefault(require("../models/admin"));
var token_1 = __importDefault(require("../models/token"));
var crypto_1 = require("../lib/crypto");
var LoginResponse = /** @class */ (function () {
    function LoginResponse(admin, token) {
        this.admin = admin;
        this.token = token;
    }
    __decorate([
        (0, class_validator_1.ValidateNested)(),
        __metadata("design:type", admin_1["default"])
    ], LoginResponse.prototype, "admin");
    __decorate([
        (0, class_validator_1.ValidateNested)(),
        __metadata("design:type", token_1["default"])
    ], LoginResponse.prototype, "token");
    return LoginResponse;
}());
exports.LoginResponse = LoginResponse;
var createLoginRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource, tokenTools = _a.tokenTools;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, _a, email, password, adminRepo, admin, token, tokenRepo, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received login request:', req.body.email);
                    _a = req.body, email = _a.email, password = _a.password;
                    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
                        res.status(400).json({ kind: 'Failure', message: 'Missing or invalid email or password' });
                        return [2 /*return*/];
                    }
                    adminRepo = dataSource.getRepository(admin_1["default"]);
                    return [4 /*yield*/, adminRepo.findOneBy({
                            email: email
                        })];
                case 1:
                    admin = _b.sent();
                    if (!admin) {
                        res.status(401).json({ kind: 'Failure', message: 'Invalid email or password' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, crypto_1.checkPassword)(password, admin.password)];
                case 2:
                    if (!(_b.sent())) {
                        res.status(401).json({ kind: 'Failure', message: 'Invalid email or password' });
                        return [2 /*return*/];
                    }
                    token = new token_1["default"]();
                    token.token = tokenTools.sign('1h', admin.id);
                    token.adminId = admin.id;
                    tokenRepo = dataSource.getRepository(token_1["default"]);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, tokenRepo.save(token)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _b.sent();
                    log('Failed to save token:', err_1);
                    res.status(500).json({ kind: 'Failure', message: 'Failed to save token' });
                    return [2 /*return*/];
                case 6:
                    res.json({
                        kind: 'Success',
                        value: new LoginResponse(admin, token)
                    });
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.createLoginRoute = createLoginRoute;
exports["default"] = exports.createLoginRoute;

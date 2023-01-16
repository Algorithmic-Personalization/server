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
exports.createRegisterRoute = void 0;
var admin_1 = __importDefault(require("../../common/models/admin"));
var util_1 = require("../../common/util");
var routes_1 = require("../../common/routes");
var crypto_1 = require("../lib/crypto");
var adminsWhitelist_1 = __importDefault(require("../../../adminsWhitelist"));
var config_extension_1 = __importDefault(require("../../../config.extension"));
var env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
if (!(0, util_1.has)("".concat(env, "-server-url"))(config_extension_1["default"])) {
    throw new Error("Missing ".concat(env, "-server-url in config"));
}
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API URL:', config_extension_1["default"]["".concat(env, "-server-url")]);
var serverUrl = config_extension_1["default"]["".concat(env, "-server-url")];
var createRegisterRoute = function (_a) {
    var dataSource = _a.dataSource, mailer = _a.mailer, mailerFrom = _a.mailerFrom, createLogger = _a.createLogger;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, admin, _a, errors, err, err, repo, existing, token, e_1, link, mailInfo, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = createLogger(req.requestId);
                    admin = new admin_1["default"]();
                    Object.assign(admin, req.body);
                    admin.createdAt = new Date();
                    admin.updatedAt = new Date();
                    _a = admin;
                    return [4 /*yield*/, (0, crypto_1.hashPassword)(admin.password)];
                case 1:
                    _a.password = _b.sent();
                    log('Received admin for registration (password is hashed):', admin);
                    return [4 /*yield*/, (0, util_1.validateExcept)('id', 'verificationToken')(admin)];
                case 2:
                    errors = _b.sent();
                    if (errors.length > 0) {
                        err = {
                            kind: 'Failure',
                            message: "Invalid entity received from client: ".concat(errors.join(', '))
                        };
                        res.status(400).json(err);
                        return [2 /*return*/];
                    }
                    if (!adminsWhitelist_1["default"].has(admin.email)) {
                        err = {
                            kind: 'Failure',
                            message: 'Email not whitelisted'
                        };
                        res.status(403).json(err);
                        return [2 /*return*/];
                    }
                    repo = dataSource.getRepository(admin_1["default"]);
                    return [4 /*yield*/, repo.findOneBy({ email: admin.email })];
                case 3:
                    existing = _b.sent();
                    if (existing) {
                        res.status(400).json({
                            kind: 'Failure',
                            message: 'Email already registered'
                        });
                        return [2 /*return*/];
                    }
                    token = (0, crypto_1.randomToken)();
                    admin.verificationToken = token;
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, repo.save(admin)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    res.status(500).json({
                        kind: 'Failure',
                        message: (0, util_1.getMessage)(e_1, 'Unknown database error')
                    });
                    return [2 /*return*/];
                case 7:
                    link = "".concat(serverUrl).concat(routes_1.getVerifyEmailToken, "?token=").concat(token);
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, mailer.sendMail({
                            from: mailerFrom,
                            to: admin.email,
                            subject: 'Please verify your email address for YTDNPL admin',
                            text: "Please past the following link in your browser to verify your email address: ".concat(link),
                            html: "Please click <a href=\"".concat(link, "\">here</a> to verify your email address.")
                        })];
                case 9:
                    mailInfo = _b.sent();
                    log('E-mail sent:', mailInfo);
                    res.status(200).json({
                        kind: 'Success',
                        value: 'Admin registered, please validate your account by clicking the link in the email you should receive shortly. Please check your spam folder if you don\'t see it in your inbox.'
                    });
                    return [3 /*break*/, 11];
                case 10:
                    e_2 = _b.sent();
                    res.status(500).json({
                        kind: 'Failure',
                        message: (0, util_1.getMessage)(e_2, 'Unknown mailer error')
                    });
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    }); };
};
exports.createRegisterRoute = createRegisterRoute;
exports["default"] = exports.createRegisterRoute;

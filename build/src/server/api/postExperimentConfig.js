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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createPostExperimentConfigRoute = void 0;
var experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
var util_1 = require("../../common/util");
var createPostExperimentConfigRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, config, _a, _id, _createdAt, _updatedAt, data, errors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received create experiment config request');
                    if (req.adminId === undefined) {
                        res.status(401).json({ kind: 'Failure', message: 'You must be logged in to create a configuration' });
                        return [2 /*return*/];
                    }
                    config = new experimentConfig_1["default"]();
                    _a = req.body, _id = _a.id, _createdAt = _a.createdAt, _updatedAt = _a.updatedAt, data = __rest(_a, ["id", "createdAt", "updatedAt"]);
                    Object.assign(config, data);
                    config.adminId = req.adminId;
                    log('config received:', config);
                    return [4 /*yield*/, (0, util_1.validateNew)(config)];
                case 1:
                    errors = _b.sent();
                    if (errors.length > 0) {
                        res.status(400).json({ kind: 'Failure', message: "".concat(errors.join(', ')) });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, dataSource.transaction(function (transaction) { return __awaiter(void 0, void 0, void 0, function () {
                            var repo, currentConfig, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        repo = transaction.getRepository(experimentConfig_1["default"]);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 6, , 7]);
                                        return [4 /*yield*/, repo.findOneBy({
                                                isCurrent: true
                                            })];
                                    case 2:
                                        currentConfig = _a.sent();
                                        if (!currentConfig) return [3 /*break*/, 4];
                                        currentConfig.isCurrent = false;
                                        currentConfig.updatedAt = new Date();
                                        return [4 /*yield*/, repo.save(currentConfig)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        config.isCurrent = true;
                                        return [4 /*yield*/, repo.save(config)];
                                    case 5:
                                        _a.sent();
                                        res.status(200).json({ kind: 'Success', value: config });
                                        return [3 /*break*/, 7];
                                    case 6:
                                        error_1 = _a.sent();
                                        log('Error while saving config:', error_1);
                                        res.status(500).json({ kind: 'Failure', message: 'An error occurred while saving the configuration' });
                                        return [3 /*break*/, 7];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.createPostExperimentConfigRoute = createPostExperimentConfigRoute;
exports["default"] = exports.createPostExperimentConfigRoute;
//# sourceMappingURL=postExperimentConfig.js.map
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createUploadParticipantsRoute = void 0;
var csv_1 = require("../lib/csv");
var participant_1 = __importDefault(require("../models/participant"));
var event_1 = require("../../common/models/event");
var participant_2 = require("../lib/participant");
var createUploadParticipantsRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, participants, participantRepo, nUpdated, nCreated, line, errorLines, reply, records, records_1, records_1_1, record, participant, existingParticipant, err_1, err_2, e_1_1, err_3;
        var e_1, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received upload participants request');
                    participants = (_b = req === null || req === void 0 ? void 0 : req.file) === null || _b === void 0 ? void 0 : _b.buffer.toString('utf-8');
                    if (!participants) {
                        log('no participants received');
                        res.status(400).json({ kind: 'Failure', message: 'No participants file' });
                        return [2 /*return*/];
                    }
                    participantRepo = dataSource.getRepository(participant_1["default"]);
                    nUpdated = 0;
                    nCreated = 0;
                    line = 1;
                    errorLines = [];
                    reply = function () {
                        var messages = [];
                        if (errorLines.length > 0) {
                            messages.push("Some records are invalid (".concat(errorLines.length, " total), at lines: ").concat(errorLines.slice(0, 10).join(', '), "..."));
                        }
                        messages.push("Created ".concat(nCreated, " new participants."));
                        messages.push("Updated ".concat(nUpdated, " existing participants."));
                        var message = messages.join(' ');
                        log('sending reply:', message);
                        res.status(200).json({ kind: 'Success', value: message });
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 18, , 19]);
                    return [4 /*yield*/, (0, csv_1.parse)(participants)];
                case 2:
                    records = _c.sent();
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 15, 16, 17]);
                    records_1 = __values(records), records_1_1 = records_1.next();
                    _c.label = 4;
                case 4:
                    if (!!records_1_1.done) return [3 /*break*/, 14];
                    record = records_1_1.value;
                    line += 1;
                    if (!(0, participant_2.isParticipantRecord)(record)) {
                        log('invalid record:', record);
                        errorLines.push(line);
                        return [3 /*break*/, 13];
                    }
                    participant = new participant_1["default"]();
                    participant.code = record.code;
                    participant.arm = record.arm === 'control' ? event_1.ExperimentArm.CONTROL : event_1.ExperimentArm.TREATMENT;
                    return [4 /*yield*/, participantRepo.findOneBy({ code: participant.code })];
                case 5:
                    existingParticipant = _c.sent();
                    if (!existingParticipant) return [3 /*break*/, 10];
                    if (!(existingParticipant.arm !== participant.arm)) return [3 /*break*/, 9];
                    existingParticipant.arm = participant.arm;
                    existingParticipant.updatedAt = new Date();
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, participantRepo.save(existingParticipant)];
                case 7:
                    // eslint-disable-next-line no-await-in-loop
                    _c.sent();
                    nUpdated += 1;
                    return [3 /*break*/, 9];
                case 8:
                    err_1 = _c.sent();
                    log('failed to update participant:', err_1);
                    errorLines.push(line);
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 13];
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    // eslint-disable-next-line no-await-in-loop
                    return [4 /*yield*/, participantRepo.save(participant)];
                case 11:
                    // eslint-disable-next-line no-await-in-loop
                    _c.sent();
                    nCreated += 1;
                    return [3 /*break*/, 13];
                case 12:
                    err_2 = _c.sent();
                    log('failed to save participant:', err_2);
                    errorLines.push(line);
                    return [3 /*break*/, 13];
                case 13:
                    records_1_1 = records_1.next();
                    return [3 /*break*/, 4];
                case 14: return [3 /*break*/, 17];
                case 15:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 17];
                case 16:
                    try {
                        if (records_1_1 && !records_1_1.done && (_a = records_1["return"])) _a.call(records_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 17:
                    reply();
                    return [3 /*break*/, 19];
                case 18:
                    err_3 = _c.sent();
                    log('failed to parse participants:', err_3);
                    res.status(400).json({ kind: 'Failure', message: 'Failed to parse participants' });
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    }); };
};
exports.createUploadParticipantsRoute = createUploadParticipantsRoute;
exports["default"] = exports.createUploadParticipantsRoute;
//# sourceMappingURL=uploadParticipants.js.map
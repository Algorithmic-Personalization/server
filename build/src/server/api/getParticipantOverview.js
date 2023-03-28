"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetParticipantOverviewRoute = exports.asyncMap = void 0;
var participant_1 = __importDefault(require("../models/participant"));
var event_1 = __importDefault(require("../../common/models/event"));
var session_1 = __importDefault(require("../../common/models/session"));
var firstDate = function (a) {
    if (a.length === 0) {
        return new Date(0);
    }
    return a[0].createdAt;
};
var lastDate = function (a) {
    if (a.length === 0) {
        return new Date(0);
    }
    return a[a.length - 1].createdAt;
};
var asyncMap = function (array) { return function (fn) { return __awaiter(void 0, void 0, void 0, function () {
    var result, array_1, array_1_1, value, _a, _b, e_1_1;
    var e_1, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                result = [];
                _d.label = 1;
            case 1:
                _d.trys.push([1, 6, 7, 8]);
                array_1 = __values(array), array_1_1 = array_1.next();
                _d.label = 2;
            case 2:
                if (!!array_1_1.done) return [3 /*break*/, 5];
                value = array_1_1.value;
                // eslint-disable-next-line no-await-in-loop
                _b = (_a = result).push;
                return [4 /*yield*/, fn(value)];
            case 3:
                // eslint-disable-next-line no-await-in-loop
                _b.apply(_a, [_d.sent()]);
                _d.label = 4;
            case 4:
                array_1_1 = array_1.next();
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 8];
            case 6:
                e_1_1 = _d.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 8];
            case 7:
                try {
                    if (array_1_1 && !array_1_1.done && (_c = array_1.return)) _c.call(array_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/, result];
        }
    });
}); }; };
exports.asyncMap = asyncMap;
var createSessionOverview = function (dataSource) { return function (session) { return __awaiter(void 0, void 0, void 0, function () {
    var eventRepo, qResult, startedAt, endedAt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventRepo = dataSource.getRepository(event_1.default);
                return [4 /*yield*/, eventRepo.createQueryBuilder()
                        .select('MIN(created_at)', 'firstDate')
                        .addSelect('MAX(created_at)', 'lastDate')
                        .addSelect('COUNT(*)', 'count')
                        .where('session_uuid = :sessionUuid', { sessionUuid: session.uuid })
                        .getRawOne()];
            case 1:
                qResult = _a.sent();
                startedAt = qResult ? qResult.firstDate : new Date(0);
                endedAt = qResult ? qResult.lastDate : new Date(0);
                return [2 /*return*/, __assign(__assign({}, session), { startedAt: startedAt, endedAt: endedAt, eventCount: qResult ? qResult.count : 0 })];
        }
    });
}); }; };
var createGetParticipantOverviewRoute = function (_a) {
    var createLogger = _a.createLogger, dataSource = _a.dataSource;
    return function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var log, participantRepo, code, participant, sessionRepo, sessions, participantOverview, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    log = createLogger(req.requestId);
                    log('Received participant overview request');
                    participantRepo = dataSource.getRepository(participant_1.default);
                    code = req.params.code;
                    if (!code) {
                        res.status(400).json({ kind: 'Error', message: 'Missing email' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, participantRepo.findOneBy({ code: code })];
                case 1:
                    participant = _c.sent();
                    if (!participant) {
                        res.status(404).json({ kind: 'Error', message: 'Participant not found' });
                        return [2 /*return*/];
                    }
                    sessionRepo = dataSource.getRepository(session_1.default);
                    return [4 /*yield*/, sessionRepo.find({
                            where: {
                                participantCode: participant.code,
                            },
                            order: {
                                createdAt: 'DESC',
                            },
                        })];
                case 2:
                    sessions = _c.sent();
                    log('Session count:', sessions.length);
                    _a = [__assign({}, participant)];
                    _b = { sessionCount: sessions.length, firstSessionDate: firstDate(sessions), latestSessionDate: lastDate(sessions) };
                    return [4 /*yield*/, (0, exports.asyncMap)(sessions)(createSessionOverview(dataSource))];
                case 3:
                    participantOverview = __assign.apply(void 0, _a.concat([(_b.sessions = _c.sent(), _b)]));
                    res.status(200).json({ kind: 'Success', value: participantOverview });
                    return [2 /*return*/];
            }
        });
    }); };
};
exports.createGetParticipantOverviewRoute = createGetParticipantOverviewRoute;
exports.default = exports.createGetParticipantOverviewRoute;
//# sourceMappingURL=getParticipantOverview.js.map
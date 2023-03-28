"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParticipantDefinition = void 0;
var participant_1 = __importStar(require("../models/participant"));
var event_1 = require("../../common/models/event");
var transitionEvent_1 = __importStar(require("../models/transitionEvent"));
var util_1 = require("../../util");
var updateParticipantPhase = function (dataSource, log) {
    return function (participant, fromPhase, toPhase) { return __awaiter(void 0, void 0, void 0, function () {
        var latestTransition, startOfLatestPhase, transition;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (fromPhase === toPhase) {
                        return [2 /*return*/, participant];
                    }
                    return [4 /*yield*/, dataSource
                            .getRepository(transitionEvent_1.default)
                            .findOne({
                            where: {
                                participantId: participant.id,
                            },
                            order: {
                                createdAt: 'DESC',
                            },
                        })];
                case 1:
                    latestTransition = _b.sent();
                    startOfLatestPhase = (_a = latestTransition === null || latestTransition === void 0 ? void 0 : latestTransition.createdAt) !== null && _a !== void 0 ? _a : participant.createdAt;
                    if (latestTransition) {
                        log('latest transition for participant', latestTransition);
                    }
                    else {
                        log('no previous transition for participant, using is creation date as entry into previous phase', startOfLatestPhase);
                    }
                    transition = new transitionEvent_1.default();
                    transition.fromPhase = fromPhase;
                    transition.toPhase = toPhase;
                    transition.participantId = participant.id;
                    transition.reason = transitionEvent_1.TransitionReason.FORCED;
                    transition.numDays = (0, util_1.daysElapsed)(startOfLatestPhase, new Date());
                    return [2 /*return*/, dataSource.transaction(function (manager) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        log('saving transition', transition);
                                        return [4 /*yield*/, manager.save(transition)];
                                    case 1:
                                        _a.sent();
                                        participant.phase = toPhase;
                                        return [4 /*yield*/, manager.save(participant)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/, participant];
                                }
                            });
                        }); })];
            }
        });
    }); };
};
exports.updateParticipantDefinition = {
    verb: 'put',
    path: '/api/participant/:code',
    makeHandler: function (_a) {
        var createLogger = _a.createLogger, dataSource = _a.dataSource;
        return function (req) { return __awaiter(void 0, void 0, void 0, function () {
            var log, _a, _unused, phase, arm, code, participantRepo, participantEntity, previousPhase;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log = createLogger(req.requestId);
                        log('Received update participant request');
                        _a = req.body, _unused = _a.id, phase = _a.phase, arm = _a.arm;
                        code = req.params.code;
                        if (!code || typeof code !== 'string') {
                            throw new Error('Invalid participant email');
                        }
                        participantRepo = dataSource.getRepository(participant_1.default);
                        return [4 /*yield*/, participantRepo.findOneBy({ code: code })];
                    case 1:
                        participantEntity = _b.sent();
                        if (!participantEntity) {
                            throw new Error('Participant with that email does not exist');
                        }
                        previousPhase = participantEntity.phase;
                        if ((0, event_1.isValidExperimentArm)(arm)) {
                            participantEntity.arm = arm;
                        }
                        if (phase && !(0, participant_1.isValidPhase)(phase)) {
                            throw new Error('Invalid phase, must be one of: 0, 1, 2');
                        }
                        if ((0, participant_1.isValidPhase)(phase)) {
                            return [2 /*return*/, updateParticipantPhase(dataSource, log)(participantEntity, previousPhase, phase)];
                        }
                        return [2 /*return*/, participantRepo.save(participantEntity)];
                }
            });
        }); };
    },
};
exports.default = exports.updateParticipantDefinition;
//# sourceMappingURL=updateParticipant.js.map
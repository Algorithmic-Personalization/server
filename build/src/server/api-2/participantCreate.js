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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParticipantDefinition = exports.isParticipantData = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const util_1 = require("../../common/util");
const event_1 = require("../../common/models/event");
const isParticipantData = (record) => (0, util_1.has)('code')(record)
    && typeof record.code === 'string'
    && record.code.length > 0
    && (!(0, util_1.has)('channelSourceId')(record)
        || typeof record.channelSourceId === 'number');
exports.isParticipantData = isParticipantData;
exports.createParticipantDefinition = {
    verb: 'post',
    path: '/api/participant',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received create participant request');
        const _a = req.body, { id: _unused } = _a, participantData = __rest(_a, ["id"]);
        log('info', 'new participant data', participantData);
        if (!(0, exports.isParticipantData)(participantData)) {
            throw new Error('Invalid participant record');
        }
        const participantRepo = dataSource.getRepository(participant_1.default);
        if (yield participantRepo.findOneBy({ code: participantData.code })) {
            throw new Error('Participant with that code already exists, use the update endpoint (PUT method) if you want to update it');
        }
        const participantEntity = new participant_1.default();
        if (!participantData.arm || participantData.arm === event_1.ExperimentArm.CONTROL || participantData.arm === '0') {
            participantData.arm = event_1.ExperimentArm.CONTROL;
        }
        else if (participantData.arm === 1 || participantData.arm === event_1.ExperimentArm.TREATMENT || participantData.arm === '1') {
            participantData.arm = event_1.ExperimentArm.TREATMENT;
        }
        else {
            log('warning', 'invalid participant arm', participantData);
            throw new Error('invalid participant arm');
        }
        participantEntity.arm = participantData.arm;
        participantEntity.code = participantData.code;
        participantEntity.isPaid = participantData.isPaid === 1;
        participantEntity.channelSourceId = participantData.channelSourceId;
        return participantRepo.save(participantEntity);
    }),
};
exports.default = exports.createParticipantDefinition;
//# sourceMappingURL=participantCreate.js.map
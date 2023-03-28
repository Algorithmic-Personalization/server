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
exports.createParticipantDefinition = void 0;
const participant_1 = require("../lib/participant");
const participant_2 = __importDefault(require("../models/participant"));
exports.createParticipantDefinition = {
    verb: 'post',
    path: '/api/participant',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received create participant request');
        const _a = req.body, { id: _unused } = _a, participantPayload = __rest(_a, ["id"]);
        if (!(0, participant_1.isParticipantRecord)(participantPayload)) {
            throw new Error('Invalid participant record');
        }
        const participantRepo = dataSource.getRepository(participant_2.default);
        if (yield participantRepo.findOneBy({ code: participantPayload.code })) {
            throw new Error('Participant with that code already exists, use the update endpoint (PUT method) if you want to update it');
        }
        const participantEntity = new participant_2.default();
        Object.assign(participantEntity, participantPayload);
        return participantRepo.save(participantEntity);
    }),
};
exports.default = exports.createParticipantDefinition;
//# sourceMappingURL=createParticipant.js.map
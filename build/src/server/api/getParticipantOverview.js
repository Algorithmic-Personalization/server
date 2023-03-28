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
exports.createGetParticipantOverviewRoute = exports.asyncMap = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const event_1 = __importDefault(require("../../common/models/event"));
const session_1 = __importDefault(require("../../common/models/session"));
const firstDate = (a) => {
    if (a.length === 0) {
        return new Date(0);
    }
    return a[0].createdAt;
};
const lastDate = (a) => {
    if (a.length === 0) {
        return new Date(0);
    }
    return a[a.length - 1].createdAt;
};
const asyncMap = (array) => (fn) => __awaiter(void 0, void 0, void 0, function* () {
    const result = [];
    // Voluntarily not doing it in parallel for now
    // in order to minimize server load
    for (const value of array) {
        // eslint-disable-next-line no-await-in-loop
        result.push(yield fn(value));
    }
    return result;
});
exports.asyncMap = asyncMap;
const createSessionOverview = (dataSource) => (session) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepo = dataSource.getRepository(event_1.default);
    const qResult = yield eventRepo.createQueryBuilder()
        .select('MIN(created_at)', 'firstDate')
        .addSelect('MAX(created_at)', 'lastDate')
        .addSelect('COUNT(*)', 'count')
        .where('session_uuid = :sessionUuid', { sessionUuid: session.uuid })
        .getRawOne();
    const startedAt = qResult ? qResult.firstDate : new Date(0);
    const endedAt = qResult ? qResult.lastDate : new Date(0);
    return Object.assign(Object.assign({}, session), { startedAt,
        endedAt, eventCount: qResult ? qResult.count : 0 });
});
const createGetParticipantOverviewRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received participant overview request');
    const participantRepo = dataSource.getRepository(participant_1.default);
    const { code } = req.params;
    if (!code) {
        res.status(400).json({ kind: 'Error', message: 'Missing email' });
        return;
    }
    const participant = yield participantRepo.findOneBy({ code });
    if (!participant) {
        res.status(404).json({ kind: 'Error', message: 'Participant not found' });
        return;
    }
    const sessionRepo = dataSource.getRepository(session_1.default);
    const sessions = yield sessionRepo.find({
        where: {
            participantCode: participant.code,
        },
        order: {
            createdAt: 'DESC',
        },
    });
    log('Session count:', sessions.length);
    const participantOverview = Object.assign(Object.assign({}, participant), { sessionCount: sessions.length, firstSessionDate: firstDate(sessions), latestSessionDate: lastDate(sessions), sessions: yield (0, exports.asyncMap)(sessions)(createSessionOverview(dataSource)) });
    res.status(200).json({ kind: 'Success', value: participantOverview });
});
exports.createGetParticipantOverviewRoute = createGetParticipantOverviewRoute;
exports.default = exports.createGetParticipantOverviewRoute;
//# sourceMappingURL=getParticipantOverview.js.map
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
exports.monitoring = void 0;
const typeorm_1 = require("typeorm");
const requestLog_1 = __importDefault(require("../models/requestLog"));
const event_1 = __importDefault(require("../../common/models/event"));
const session_1 = __importDefault(require("../../common/models/session"));
const util_1 = require("../../common/util");
const getReport = (dataSource, log) => ({ fromDate, toDate }) => __awaiter(void 0, void 0, void 0, function* () {
    log('generating report from', fromDate, 'inclusive to', toDate, 'exclusive');
    const requestRepo = dataSource.getRepository(requestLog_1.default);
    const nPagesViewed = yield requestRepo.count({
        where: [{
                createdAt: (0, typeorm_1.MoreThan)(fromDate),
            }, {
                createdAt: (0, typeorm_1.LessThan)(toDate),
            }],
    });
    const data = yield dataSource.createQueryBuilder()
        .select('count(distinct participant_id)', 'nUniqueParticipants')
        .from(event_1.default, 'e')
        .innerJoin(session_1.default, 's', 'e.session_uuid = s.uuid')
        .where('s.created_at > :startDate', { fromDate })
        // It's OK to use < here because endDate is tomorrow,
        // so if we query week after week, we won't double count
        // the same data and we should cover everything.
        .andWhere('s.created_at < :endDate', { toDate })
        .getRawOne();
    if (typeof data !== 'object') {
        throw new Error('Unexpected result from query: not an object');
    }
    if (!(0, util_1.has)('nUniqueParticipants')(data)) {
        throw new Error('Unexpected result from query: missing nUniqueParticipants');
    }
    if (typeof data.nUniqueParticipants !== 'number') {
        throw new Error('Unexpected result from query: nUniqueParticipants is not a number');
    }
    return {
        nPagesViewed,
        nUniqueParticipants: data.nUniqueParticipants,
    };
});
exports.monitoring = {
    verb: 'get',
    path: '/api/monitoring',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received monitoring request');
        const now = new Date();
        const fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const report = getReport(dataSource, log);
        return report({ fromDate, toDate });
    }),
};
//# sourceMappingURL=monitoring.js.map
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
exports.monitoringDefinition = void 0;
const typeorm_1 = require("typeorm");
const requestLog_1 = __importDefault(require("../models/requestLog"));
const event_1 = __importDefault(require("../../common/models/event"));
const session_1 = __importDefault(require("../../common/models/session"));
const util_1 = require("../../common/util");
const util_2 = require("../../util");
const getMostViewedPages = (dataSource, log) => ({ fromDate, toDate }) => __awaiter(void 0, void 0, void 0, function* () {
    const show = (0, util_2.showSql)(log);
    const mostViewedPagesRaw = yield show(dataSource.createQueryBuilder()
        .select('count(*)', 'count')
        .addSelect('url')
        .from(event_1.default, 'e')
        .groupBy('url')
        .orderBy('count(*)', 'DESC')
        .where({
        createdAt: (0, typeorm_1.And)((0, typeorm_1.MoreThan)(fromDate), (0, typeorm_1.LessThanOrEqual)(toDate)),
    }).andWhere({
        type: 'PAGE_VIEW',
    })).getRawMany();
    const mostViewedPages = [];
    for (const r of mostViewedPagesRaw) {
        if (typeof r !== 'object' || !r) {
            log('warning', 'unexpected result from most viewed pages query:', r);
            continue;
        }
        if (!(0, util_1.has)('url')(r)) {
            log('warning', 'unexpected result from most viewed pages query, no url found:', r);
            continue;
        }
        if (!(0, util_1.has)('count')(r)) {
            log('warning', 'unexpected result from most viewed pages query, no count found:', r);
            continue;
        }
        if (typeof r.url !== 'string') {
            log('warning', 'unexpected result from most viewed pages query, url is not a string:', r);
            continue;
        }
        const count = Number(r.count);
        if (isNaN(count)) {
            log('warning', 'unexpected result from most viewed pages query, count is not a number:', r);
            continue;
        }
        mostViewedPages.push({
            url: r.url,
            count,
        });
    }
    return mostViewedPages;
});
const getReport = (dataSource, log) => ({ fromDate, toDate }) => __awaiter(void 0, void 0, void 0, function* () {
    log('generating report from', fromDate, 'exclusive to', toDate, 'inclusive');
    const show = (0, util_2.showSql)(log);
    const requestRepo = dataSource.getRepository(requestLog_1.default);
    const nPagesViewed = yield requestRepo.count({
        where: {
            createdAt: (0, typeorm_1.And)((0, typeorm_1.MoreThan)(fromDate), (0, typeorm_1.LessThanOrEqual)(toDate)),
        },
    });
    const averageLatencyRes = yield show(requestRepo.createQueryBuilder()
        .select('avg(latency_ms)', 'averageLatency')
        .where({
        createdAt: (0, typeorm_1.And)((0, typeorm_1.MoreThan)(fromDate), (0, typeorm_1.LessThanOrEqual)(toDate)),
    })).getRawOne();
    if (typeof averageLatencyRes !== 'object' || !averageLatencyRes) {
        log('error', 'Unexpected result from query: not an object', averageLatencyRes);
        throw new Error('Unexpected result from query: not an object');
    }
    if (!(0, util_1.has)('averageLatency')(averageLatencyRes)) {
        log('error', 'Unexpected result from query: missing averageLatency', averageLatencyRes);
        throw new Error('Unexpected result from query: missing averageLatency');
    }
    const averageLatency = Math.round(Number(averageLatencyRes.averageLatency));
    if (isNaN(averageLatency)) {
        log('error', 'Unexpected result from query: averageLatency is not a number', averageLatencyRes);
        throw new Error('Unexpected result from query: averageLatency is not a number');
    }
    const data = yield show(dataSource.createQueryBuilder()
        .select('count(distinct participant_code)', 'nUniqueParticipants')
        .from(event_1.default, 'e')
        .innerJoin(session_1.default, 's', 'e.session_uuid = s.uuid')
        .where({
        createdAt: (0, typeorm_1.And)((0, typeorm_1.MoreThan)(fromDate), (0, typeorm_1.LessThanOrEqual)(toDate))
    })).getRawOne();
    log('info', 'got data for number of unique participants:', data);
    if (typeof data !== 'object') {
        throw new Error('Unexpected result from query: not an object');
    }
    if (!(0, util_1.has)('nUniqueParticipants')(data)) {
        throw new Error('Unexpected result from query: missing nUniqueParticipants');
    }
    const nUniqueParticipants = Number(data.nUniqueParticipants);
    if (isNaN(nUniqueParticipants)) {
        throw new Error('Unexpected result from query: nUniqueParticipants is not a number');
    }
    const mostViewedPages = yield getMostViewedPages(dataSource, log)({ fromDate, toDate });
    return {
        nPagesViewed,
        nUniqueParticipants,
        mostViewedPages,
        averageLatency,
    };
});
const createGetQuery = (log) => (query) => {
    const { fromDate: fromMs, toDate: toMs } = query;
    const from = Number(fromMs);
    const to = Number(toMs);
    let ok = true;
    if (isNaN(from)) {
        log('getQuery: invalid fromDate');
        ok = false;
    }
    if (isNaN(to)) {
        log('getQuery: invalid toDate');
        ok = false;
    }
    if (!ok) {
        return undefined;
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return {
        fromDate,
        toDate,
    };
};
const getDefaultQuery = () => {
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - (1000 * 60 * 60 * 24));
    return {
        fromDate,
        toDate,
    };
};
exports.monitoringDefinition = {
    verb: 'get',
    path: '/api/monitoring',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const log = createLogger(req.requestId);
        log('info', 'received monitoring request', req.query);
        const getQuery = createGetQuery(log);
        const query = (_a = getQuery(req.query)) !== null && _a !== void 0 ? _a : getDefaultQuery();
        const report = getReport(dataSource, log);
        return report(query);
    }),
};
exports.default = exports.monitoringDefinition;
//# sourceMappingURL=monitoring.js.map
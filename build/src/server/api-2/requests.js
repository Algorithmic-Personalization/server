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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requests = void 0;
const requestLog_1 = require("../models/requestLog");
exports.requests = {
    verb: 'post',
    path: '/api/requests',
    responseIsStream: true,
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'received obtain requests log request', req.body);
        const { fromDate: fromMs, toDate: toMs } = req.body;
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
            throw new Error('invalid query');
        }
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const reqLogRepo = dataSource.getRepository(requestLog_1.RequestLog);
        const reqLogQb = reqLogRepo
            .createQueryBuilder('requestLog')
            .where('verb = :verb', { verb: 'POST' })
            .andWhere('created_at >= :fromDate', { fromDate })
            .andWhere('created_at <= :toDate', { toDate });
        const requestsStream = yield reqLogQb.stream();
        log('debug', { requestsStream: requestsStream.pipe }, 'requests stream');
        return requestsStream;
    }),
};
exports.default = exports.requests;
//# sourceMappingURL=requests.js.map
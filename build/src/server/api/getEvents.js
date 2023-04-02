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
exports.createGetEventsRoute = void 0;
const event_1 = __importDefault(require("../../common/models/event"));
const pagination_1 = require("../lib/pagination");
const createGetEventsRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('received get event request');
    const repo = dataSource.getRepository(event_1.default);
    const { page, pageSize } = (0, pagination_1.extractPaginationRequest)(req);
    try {
        const results = yield repo
            .find({
            skip: page * pageSize,
            take: pageSize,
            order: {
                id: 'DESC',
            },
        });
        const count = yield repo.count();
        const data = {
            results,
            page,
            pageSize,
            pageCount: Math.ceil(count / pageSize),
            count,
        };
        res.status(200).json({ kind: 'Success', value: data });
    }
    catch (error) {
        log('Error getting events', error);
        res.status(500).json({ kind: 'Error', message: 'Error getting events' });
    }
});
exports.createGetEventsRoute = createGetEventsRoute;
exports.default = exports.createGetEventsRoute;
//# sourceMappingURL=getEvents.js.map
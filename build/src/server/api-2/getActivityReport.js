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
exports.createGetActivityReportDefinition = void 0;
const dailyActivityTime_1 = __importDefault(require("../models/dailyActivityTime"));
exports.createGetActivityReportDefinition = {
    verb: 'get',
    path: '/api/activity-report',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received get activity report request');
        const activityRepo = dataSource.getRepository(dailyActivityTime_1.default);
        const latestActivity = yield activityRepo.find({
            order: {
                createdAt: 'DESC',
                updatedAt: 'DESC',
            },
            relations: ['participant'],
            take: 100,
        });
        return {
            latest: latestActivity,
        };
    }),
};
exports.default = exports.createGetActivityReportDefinition;
//# sourceMappingURL=getActivityReport.js.map
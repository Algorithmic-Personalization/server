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
exports.createGetExperimentConfigHistoryRoute = void 0;
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const createGetExperimentConfigHistoryRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received experiment config history request');
    const repo = dataSource.getRepository(experimentConfig_1.default);
    const take = 30;
    try {
        const configs = yield repo.find({
            take,
            order: {
                createdAt: 'DESC',
            },
            relations: ['admin'],
        });
        res.status(200).json({
            kind: 'Success',
            value: configs,
        });
    }
    catch (error) {
        log('Error while fetching config history:', error);
        res.status(500).json({ kind: 'Failure', message: 'An error occurred while fetching the configuration history' });
    }
});
exports.createGetExperimentConfigHistoryRoute = createGetExperimentConfigHistoryRoute;
exports.default = exports.createGetExperimentConfigHistoryRoute;
//# sourceMappingURL=getExperimentConfigHistory.js.map
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
exports.createGetExperimentConfigRoute = void 0;
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const createGetExperimentConfigRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received experiment config request');
    const repo = dataSource.getRepository(experimentConfig_1.default);
    const config = yield repo.findOneBy({
        isCurrent: true,
    });
    log('config found:', config);
    if (config) {
        res.status(200).json({
            kind: 'Success',
            value: config,
        });
        return;
    }
    res.status(404).json({ kind: 'Failure', message: 'No configuration found on the server, please create one' });
});
exports.createGetExperimentConfigRoute = createGetExperimentConfigRoute;
exports.default = exports.createGetExperimentConfigRoute;
//# sourceMappingURL=getExperimentConfig.js.map
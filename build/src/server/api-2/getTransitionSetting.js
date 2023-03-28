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
exports.getTransitionSettingDefinition = void 0;
const notFoundError_1 = __importDefault(require("../lib/notFoundError"));
const transitionSetting_1 = __importDefault(require("../models/transitionSetting"));
exports.getTransitionSettingDefinition = {
    verb: 'get',
    path: '/api/transition-setting',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received get transitionSetting request');
        const { from, to } = req.query;
        const fromNumber = Number(from);
        const toNumber = Number(to);
        if (isNaN(fromNumber) || isNaN(toNumber)) {
            throw new Error('Invalid phase numbers');
        }
        if (fromNumber < 0 || toNumber < 0) {
            throw new Error('Invalid phase numbers');
        }
        if (fromNumber > 2 || toNumber > 2) {
            throw new Error('Invalid phase numbers');
        }
        const repo = dataSource.getRepository(transitionSetting_1.default);
        const setting = yield repo.findOneBy({
            isCurrent: true,
            fromPhase: fromNumber,
            toPhase: toNumber,
        });
        if (!setting) {
            throw new notFoundError_1.default('No transition setting found');
        }
        return setting;
    }),
};
exports.default = exports.getTransitionSettingDefinition;
//# sourceMappingURL=getTransitionSetting.js.map
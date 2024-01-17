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
exports.createTransitionSettingDefinition = void 0;
const transitionSetting_1 = __importDefault(require("../models/transitionSetting"));
const util_1 = require("../../common/util");
exports.createTransitionSettingDefinition = {
    verb: 'post',
    path: '/api/transition-setting',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received create transitionSetting request');
        const payload = req.body;
        const setting = new transitionSetting_1.default();
        Object.assign(setting, payload);
        const errors = yield (0, util_1.validateNew)(transitionSetting_1.default);
        if (errors.length > 0) {
            throw new Error('Invalid transitionSetting record: ' + errors.join(', '));
        }
        return dataSource.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
            const repo = transaction.getRepository(transitionSetting_1.default);
            const current = yield repo.findOneBy({
                isCurrent: true,
                fromPhase: setting.fromPhase,
                toPhase: setting.toPhase,
            });
            if (current) {
                current.isCurrent = false;
                current.updatedAt = new Date();
                yield repo.save(current);
            }
            setting.id = 0;
            setting.isCurrent = true;
            setting.createdAt = new Date();
            setting.updatedAt = new Date();
            return repo.save(setting);
        }));
    }),
};
exports.default = exports.createTransitionSettingDefinition;
//# sourceMappingURL=transitionSettingsCreate.js.map
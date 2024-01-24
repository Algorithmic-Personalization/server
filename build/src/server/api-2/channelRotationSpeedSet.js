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
exports.channelRotationSpeedGetDefinition = void 0;
const channelRotationSpeedSetting_1 = __importDefault(require("../models/channelRotationSpeedSetting"));
const hasSpeedHours = (record) => {
    if (typeof record !== 'object' || record === null) {
        return false;
    }
    const { speedHours } = record;
    if (typeof speedHours !== 'number') {
        return false;
    }
    if (Number.isNaN(speedHours)) {
        return false;
    }
    return true;
};
exports.channelRotationSpeedGetDefinition = {
    verb: 'post',
    path: '/api/channel-rotation-speed',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'received channel rotation speed get request');
        if (!hasSpeedHours(req.body)) {
            throw new Error('Invalid channel rotation speed');
        }
        const { speedHours } = req.body;
        const speedSetting = yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            yield manager.update(channelRotationSpeedSetting_1.default, {
                isCurrent: true,
            }, {
                isCurrent: false,
                updatedAt: new Date(),
            });
            const setting = new channelRotationSpeedSetting_1.default();
            setting.speedHours = speedHours;
            setting.isCurrent = true;
            return manager.save(setting);
        }));
        return speedSetting;
    }),
};
exports.default = exports.channelRotationSpeedGetDefinition;
//# sourceMappingURL=channelRotationSpeedSet.js.map
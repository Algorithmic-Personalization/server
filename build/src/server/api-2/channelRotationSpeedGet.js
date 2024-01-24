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
exports.channelRotationSpeedGetDefinition = exports.getRotationSpeed = void 0;
const channelRotationSpeedSetting_1 = __importDefault(require("../models/channelRotationSpeedSetting"));
const getRotationSpeed = (qr) => __awaiter(void 0, void 0, void 0, function* () {
    const speed = yield qr.manager
        .getRepository(channelRotationSpeedSetting_1.default)
        .findOne({
        where: {
            isCurrent: true,
        },
    });
    if (!speed) {
        const defaultSpeed = new channelRotationSpeedSetting_1.default();
        return defaultSpeed;
    }
    return speed;
});
exports.getRotationSpeed = getRotationSpeed;
exports.channelRotationSpeedGetDefinition = {
    verb: 'get',
    path: '/api/channel-rotation-speed',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'received channel rotation speed get request');
        const speed = yield (0, exports.getRotationSpeed)(dataSource.createQueryRunner());
        return speed;
    }),
};
exports.default = exports.channelRotationSpeedGetDefinition;
//# sourceMappingURL=channelRotationSpeedGet.js.map
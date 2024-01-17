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
exports.isInputType = void 0;
const channelSource_1 = __importDefault(require("../models/channelSource"));
const channelSourceItem_1 = __importDefault(require("../models/channelSourceItem"));
const isInputType = (record) => {
    if (typeof record !== 'object' || record === null) {
        return false;
    }
    const { title, channelIds, isDefault } = record;
    if (title !== undefined && typeof title !== 'string') {
        return false;
    }
    if (!Array.isArray(channelIds)) {
        return false;
    }
    if (channelIds.some(channel => typeof channel !== 'string')) {
        return false;
    }
    if (isDefault !== undefined && typeof isDefault !== 'boolean') {
        return false;
    }
    return true;
};
exports.isInputType = isInputType;
const createChannelSourceDefinition = {
    verb: 'post',
    path: '/api/channel-source',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received create channel source request');
        if (!(0, exports.isInputType)(req.body)) {
            throw new Error('Invalid channel source record');
        }
        const { title, channelIds, isDefault } = req.body;
        const channelSource = new channelSource_1.default();
        channelSource.title = title;
        const res = yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            const defaultSource = yield manager.findOne(channelSource_1.default, {
                where: {
                    isDefault: true,
                },
            });
            if (defaultSource && isDefault) {
                defaultSource.isDefault = false;
                yield manager.save(defaultSource);
            }
            if (!defaultSource) {
                channelSource.isDefault = true;
            }
            const src = yield manager.save(channelSource);
            const items = channelIds.map((channelId, position) => {
                const item = new channelSourceItem_1.default();
                item.channelSourceId = src.id;
                item.youtubeChannelId = channelId;
                item.position = position;
                return item;
            });
            yield manager.save(items);
            return src;
        }));
        return res;
    }),
};
exports.default = createChannelSourceDefinition;
//# sourceMappingURL=channelSourceCreate.js.map
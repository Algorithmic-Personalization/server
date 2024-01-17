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
const channelSource_1 = __importDefault(require("../models/channelSource"));
const channelSourceItem_1 = __importDefault(require("../models/channelSourceItem"));
const participant_1 = __importDefault(require("../models/participant"));
const channelSourceCreate_1 = require("./channelSourceCreate");
const isInputType = (record) => {
    if (!(0, channelSourceCreate_1.isInputType)(record)) {
        return false;
    }
    const { resetParticipantPositions } = record;
    if (resetParticipantPositions !== undefined && typeof resetParticipantPositions !== 'boolean') {
        return false;
    }
    return true;
};
const createChannelSourceDefinition = {
    verb: 'post',
    path: '/api/channel-source/:id',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received update channel source request');
        if (!isInputType(req.body)) {
            throw new Error('Invalid channel source record');
        }
        const { id: reqId } = req.params;
        const numericId = Number(reqId);
        if (isNaN(numericId)) {
            throw new Error('Invalid channel source id');
        }
        const { title, channelIds, isDefault, resetParticipantPositions } = req.body;
        const res = yield dataSource.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
            const source = yield manager.findOne(channelSource_1.default, {
                where: {
                    id: numericId,
                },
            });
            if (!source) {
                throw new Error('Channel source not found');
            }
            if (source.isDefault && !isDefault) {
                throw new Error('Cannot unset default channel source');
            }
            if (isDefault && !source.isDefault) {
                yield manager.update(channelSource_1.default, {
                    isDefault: true,
                }, {
                    isDefault: false,
                });
                source.isDefault = true;
                if (title) {
                    source.title = title;
                }
                source.updatedAt = new Date();
                yield manager.save(source);
            }
            yield manager.delete(channelSourceItem_1.default, {
                channelSourceId: numericId,
            });
            const items = channelIds.map((channelId, position) => {
                const item = new channelSourceItem_1.default();
                item.channelSourceId = numericId;
                item.youtubeChannelId = channelId;
                item.position = position;
                return item;
            });
            yield manager.save(items);
            if (resetParticipantPositions) {
                if (source.isDefault) {
                    yield manager.update(participant_1.default, {
                        channelSourceId: null,
                    }, {
                        posInChannelSource: 0,
                        posInChannelSourceLastUpdatedAt: new Date(),
                    });
                }
                else {
                    yield manager.update(participant_1.default, {
                        channelSourceId: numericId,
                    }, {
                        posInChannelSource: 0,
                        posInChannelSourceLastUpdatedAt: new Date(),
                    });
                }
            }
            return manager.findOne(channelSource_1.default, {
                where: {
                    id: numericId,
                },
            });
        }));
        if (!res) {
            throw new Error('Channel source not found - this should never happen');
        }
        return res;
    }),
};
exports.default = createChannelSourceDefinition;
//# sourceMappingURL=channelSourceUpdate.js.map
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
exports.updateIfNeededAndGetParticipantChannelSource = exports.getParticipantChannelSource = exports.advanceParticipantPositionInChannelSource = void 0;
const clientRoutes_1 = require("../../common/clientRoutes");
const channelSourceItem_1 = __importDefault(require("../models/channelSourceItem"));
const channelSource_1 = __importDefault(require("../models/channelSource"));
const unusableChannel_1 = __importDefault(require("../models/unusableChannel"));
const participant_1 = __importDefault(require("../models/participant"));
const channelRotationSpeedGet_1 = require("./channelRotationSpeedGet");
const advanceParticipantPositionInChannelSource = (qr, log) => (participant) => __awaiter(void 0, void 0, void 0, function* () {
    const { channelSourceId, posInChannelSource, code, arm } = participant;
    if (arm === 'control') {
        log('error', 'participant is in control arm, not looking for a channel source');
        throw new Error('Participant is in control arm');
    }
    log('info', 'trying to advance participant', code, 'from channel source', channelSourceId !== null && channelSourceId !== void 0 ? channelSourceId : 'default', 'and position', posInChannelSource, 'to', posInChannelSource + 1);
    const repo = qr.manager.getRepository(channelSourceItem_1.default);
    const item = yield repo.findOne({
        where: {
            channelSourceId,
            position: posInChannelSource + 1,
        },
    });
    if (item) {
        log('info', 'participant can be advanced, there are channels left');
        yield qr.manager.update(participant_1.default, participant.id, {
            posInChannelSource: posInChannelSource + 1,
            posInChannelSourceLastUpdatedAt: new Date(),
        });
        log('success', 'participant', code, 'advanced successfully', 'from channel source', channelSourceId !== null && channelSourceId !== void 0 ? channelSourceId : 'default', 'and position', posInChannelSource, 'to', posInChannelSource + 1);
    }
    else {
        log('info', 'participant cannot be advanced, there are no channels left in this source', channelSourceId !== null && channelSourceId !== void 0 ? channelSourceId : 'default');
    }
    return (0, exports.getParticipantChannelSource)(qr, log)(participant.code);
});
exports.advanceParticipantPositionInChannelSource = advanceParticipantPositionInChannelSource;
const getParticipantChannelSource = (qr, log) => (participant) => __awaiter(void 0, void 0, void 0, function* () {
    const getParticipant = () => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof participant === 'string') {
            const p = yield qr.manager.getRepository(participant_1.default).findOne({
                where: {
                    code: participant,
                },
                select: ['channelSourceId', 'posInChannelSource'],
            });
            if (!p) {
                throw new Error('Participant not found', {
                    cause: 'NO_CHANNEL_SOURCE_FOUND',
                });
            }
            return p;
        }
        return participant;
    });
    const { channelSourceId: maybeSourceId, posInChannelSource } = yield getParticipant();
    const getChannelSourceId = () => __awaiter(void 0, void 0, void 0, function* () {
        if (maybeSourceId) {
            return maybeSourceId;
        }
        const defaultSource = yield qr.manager.getRepository(channelSource_1.default).findOne({
            where: {
                isDefault: true,
            },
        });
        if (defaultSource) {
            return defaultSource.id;
        }
        throw new Error('No default channel source found');
    });
    log('info', 'getting participant channel from source', maybeSourceId !== null && maybeSourceId !== void 0 ? maybeSourceId : 'default', 'and position', posInChannelSource);
    const repo = qr.manager.getRepository(channelSourceItem_1.default);
    const item = yield repo.findOne({
        where: {
            channelSourceId: yield getChannelSourceId(),
            position: posInChannelSource,
        },
    });
    if (item) {
        const res = {
            channelId: item.youtubeChannelId,
            pos: posInChannelSource,
        };
        log('success', 'participant channel source item found', res);
        return res;
    }
    throw new Error('Participant channel source item not found');
});
exports.getParticipantChannelSource = getParticipantChannelSource;
const isPositionUpdateNeeded = (qr, log) => (participant) => __awaiter(void 0, void 0, void 0, function* () {
    const getParticipant = () => __awaiter(void 0, void 0, void 0, function* () {
        if (typeof participant === 'string') {
            const p = yield qr.manager.getRepository(participant_1.default).findOne({
                where: {
                    code: participant,
                },
                select: ['channelSourceId', 'posInChannelSource', 'posInChannelSourceLastUpdatedAt'],
            });
            if (!p) {
                throw new Error('Participant not found');
            }
            return p;
        }
        return participant;
    });
    const { channelSourceId, posInChannelSource, posInChannelSourceLastUpdatedAt, arm, phase, } = yield getParticipant();
    if (arm === 'control') {
        log('info', 'participant is not in control arm, not looking for a channel source');
        return false;
    }
    if (phase > 1) {
        log('info', 'participant is in phase', phase, 'not looking for a channel source');
        return false;
    }
    log('info', 'checking if participant needs to be advanced from channel source', channelSourceId !== null && channelSourceId !== void 0 ? channelSourceId : 'default', 'and position', posInChannelSource, 'based on time alone');
    const rotationSpeed = yield (0, channelRotationSpeedGet_1.getRotationSpeed)(qr);
    log('info', 'channel rotation speed currently is', rotationSpeed.speedHours, 'hours');
    const dtDays = ((new Date()).getTime() - posInChannelSourceLastUpdatedAt.getTime())
        / 1000 / 60 / 60 / 24;
    log('info', 'dtDays', dtDays);
    const res = dtDays >= rotationSpeed.speedHours / 24;
    if (res) {
        log('info', 'participant needs to be advanced');
    }
    else {
        log('info', 'participant does not need to be advanced');
    }
    return res;
});
const updateIfNeededAndGetParticipantChannelSource = (qr, log) => (participant, force = false) => __awaiter(void 0, void 0, void 0, function* () {
    log('info', 'updating (if needed) and getting participant channel source');
    const needsUpdate = force || (yield isPositionUpdateNeeded(qr, log)(participant));
    log('info', 'needs update', needsUpdate);
    if (needsUpdate) {
        return (0, exports.advanceParticipantPositionInChannelSource)(qr, log)(participant);
    }
    return (0, exports.getParticipantChannelSource)(qr, log)(participant);
});
exports.updateIfNeededAndGetParticipantChannelSource = updateIfNeededAndGetParticipantChannelSource;
const getParticipantChannelSourceDefinition = {
    verb: 'get',
    path: clientRoutes_1.getParticipantChannelSource,
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('Received get channel source for participant request');
        const { participantCode } = req;
        const force = req.query.force === 'true';
        if (force) {
            log('info', 'the client requested to force the switch to the next channel');
        }
        if (typeof participantCode !== 'string') {
            throw new Error('Invalid participant code - should never happen cuz of middleware');
        }
        log('info', 'participant code', participantCode);
        const qr = dataSource.createQueryRunner();
        const update = (0, exports.updateIfNeededAndGetParticipantChannelSource)(qr, log);
        const getChannelSource = (0, exports.getParticipantChannelSource)(qr, log);
        const posNeedsUpdate = isPositionUpdateNeeded(qr, log);
        if (force) {
            const invalidChannel = yield getChannelSource(participantCode);
            dataSource.getRepository(unusableChannel_1.default).createQueryBuilder().insert().values({
                youtubeChannelId: invalidChannel.channelId,
            }).orIgnore().execute()
                .then(() => {
                log('info', 'marked channel', invalidChannel.channelId, 'as unusable');
            })
                .catch(err => {
                log('error', 'failed to insert unusable channel', err);
            });
        }
        try {
            yield qr.connect();
            yield qr.startTransaction();
            const participant = yield qr.manager.getRepository(participant_1.default).findOneOrFail({
                where: {
                    code: participantCode,
                },
            });
            const res = yield update(participant, force);
            yield qr.commitTransaction();
            return res;
        }
        catch (err) {
            if (qr.isTransactionActive) {
                yield qr.rollbackTransaction();
            }
            // This is to return a non error response in case a concurrent request
            // already did the job
            if (yield posNeedsUpdate(participantCode)) {
                log('error', 'failed to advance participant in channel source', err);
                throw err;
            }
            const res = yield getChannelSource(participantCode);
            log('success', 'participant channel source found', res);
            return res;
        }
        finally {
            yield qr.release();
        }
    }),
};
exports.default = getParticipantChannelSourceDefinition;
//# sourceMappingURL=channelSourceGetForParticipant.js.map
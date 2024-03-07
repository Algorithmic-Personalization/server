"use strict";
/* eslint-disable no-bitwise */
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
exports.createParticipantMiddleWare = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const pretty = (str) => {
    const bits = [];
    for (let i = 0; i < str.length; i += 2) {
        const bit = [str[i].toLocaleUpperCase()];
        if (str[i + 1]) {
            bit.push(str[i + 1].toLocaleLowerCase());
        }
        bits.push(bit.join(''));
    }
    return bits.join('-');
};
const hash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return pretty(hash.toString(16));
};
const createParticipantMiddleWare = (config) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const log = config.createLogger(req.requestId);
    const extraLog = config.extraLogger(req.requestId);
    const participantCode = req.headers['x-participant-code'];
    log('checking participant code:', participantCode);
    // Yes, sending a 200 response is intentional
    // it is ugly, but clients will retry sending events to the server
    // indefinitely until they get a 200 response from the server.
    // And the mechanism was not designed in a way that lets the server
    // tell clients that they should just give up.
    // So in the cases where we know the request is invalid, we
    // send a 200 response with a failure message so that clients
    // can stop retrying.
    const bail = () => {
        var _a;
        extraLog('error', 'invalid participant code', {
            url: req.url,
            body: req.body,
            ip: req.ip,
            forwardedFor: req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent'],
            userAgentHash: hash((_a = req.headers['user-agent']) !== null && _a !== void 0 ? _a : ''),
        });
        res.status(200).json({
            kind: 'Failure',
            message: 'Invalid participant code',
            code: 'EVENT_ALREADY_EXISTS_OK',
        });
    };
    if (typeof participantCode !== 'string') {
        log('warning', 'participant code is not a string:', participantCode);
        bail();
        return;
    }
    if (!participantCode) {
        log('warning', 'participant code is empty');
        bail();
        return;
    }
    const participantRepo = config.dataSource.getRepository(participant_1.default);
    const codeExists = yield participantRepo.exist({ where: { code: participantCode } });
    if (!codeExists) {
        log('warning', 'participant code does not exist:', participantCode);
        bail();
        return;
    }
    req.participantCode = participantCode;
    log('info', 'participant code is valid:', participantCode);
    next();
});
exports.createParticipantMiddleWare = createParticipantMiddleWare;
exports.default = exports.createParticipantMiddleWare;
//# sourceMappingURL=participantMiddleware.js.map
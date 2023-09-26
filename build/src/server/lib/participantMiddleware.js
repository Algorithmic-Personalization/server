"use strict";
/* eslint-disable no-bitwise */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParticipantMiddleWare = void 0;
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
const createParticipantMiddleWare = (createLogger, extraLogger) => (req, res, next) => {
    const log = createLogger(req.requestId);
    const extraLog = extraLogger(req.requestId);
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
            userAgent: req.headers['user-agent'],
            userAgentHash: hash((_a = req.headers['user-agent']) !== null && _a !== void 0 ? _a : ''),
        });
        res.status(200).json({
            kind: 'Failure',
            message: 'Invalid participant code',
        });
    };
    if (typeof participantCode !== 'string') {
        log('error', 'participant code is not a string:', participantCode);
        bail();
        return;
    }
    if (!participantCode) {
        log('error', 'participant code is empty');
        bail();
        return;
    }
    req.participantCode = participantCode;
    log('participant code is valid:', participantCode);
    next();
};
exports.createParticipantMiddleWare = createParticipantMiddleWare;
exports.default = exports.createParticipantMiddleWare;
//# sourceMappingURL=participantMiddleware.js.map
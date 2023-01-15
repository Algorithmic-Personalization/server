"use strict";
exports.__esModule = true;
exports.createParticipantMiddleWare = void 0;
var createParticipantMiddleWare = function (createLogger) {
    return function (req, res, next) {
        var log = createLogger(req.requestId);
        var participantCode = req.headers['x-participant-code'];
        log('checking participant code:', participantCode);
        if (typeof participantCode !== 'string') {
            log('Participant code is not a string');
            res.status(401).json({ kind: 'Failure', message: 'Invalid participant code header', code: 'NOT_AUTHENTICATED' });
            return;
        }
        if (!participantCode) {
            log('participant code is empty');
            res.status(401).json({ kind: 'Failure', message: 'Missing participant code header', code: 'NOT_AUTHENTICATED' });
            return;
        }
        req.participantCode = participantCode;
        log('participant code is valid:', participantCode);
        next();
    };
};
exports.createParticipantMiddleWare = createParticipantMiddleWare;
exports["default"] = exports.createParticipantMiddleWare;

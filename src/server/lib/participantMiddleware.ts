import type express from 'express';

import {type CreateLogger} from './logger';

export const createParticipantMiddleWare = (createLogger: CreateLogger) =>
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		const log = createLogger(req.requestId);
		const participantCode = req.headers['x-participant-code'];

		log('checking participant code:', participantCode);

		if (typeof participantCode !== 'string') {
			log('Participant code is not a string');
			res.status(401).json({kind: 'Failure', message: 'Invalid participant code header', code: 'NOT_AUTHENTICATED'});
			return;
		}

		if (!participantCode) {
			log('participant code is empty');
			res.status(401).json({kind: 'Failure', message: 'Missing participant code header', code: 'NOT_AUTHENTICATED'});
			return;
		}

		req.participantCode = participantCode;
		log('participant code is valid:', participantCode);

		next();
	};

export default createParticipantMiddleWare;

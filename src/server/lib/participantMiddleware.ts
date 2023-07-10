import type express from 'express';

import {type CreateLogger} from './logger';

export const createParticipantMiddleWare = (createLogger: CreateLogger) =>
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		const log = createLogger(req.requestId);
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

export default createParticipantMiddleWare;

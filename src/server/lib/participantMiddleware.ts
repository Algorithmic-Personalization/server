/* eslint-disable no-bitwise */

import type express from 'express';

import {type CreateLogger} from './logger';

const pretty = (str: string): string => {
	const bits: string[] = [];

	for (let i = 0; i < str.length; i += 2) {
		const bit = [str[i].toLocaleUpperCase()];
		if (str[i + 1]) {
			bit.push(str[i + 1].toLocaleLowerCase());
		}

		bits.push(bit.join(''));
	}

	return bits.join('-');
};

const hash = (str: string): string => {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) - hash) + str.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}

	return pretty(hash.toString(16));
};

export const createParticipantMiddleWare = (createLogger: CreateLogger, extraLogger: CreateLogger) =>
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
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
			extraLog('error', 'invalid participant code', {
				url: req.url,
				body: req.body as unknown,
				ip: req.ip,
				userAgent: req.headers['user-agent'],
				userAgentHash: hash(req.headers['user-agent'] ?? ''),
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

export default createParticipantMiddleWare;

/* eslint-disable no-bitwise */

import type express from 'express';

import {type CreateLogger} from './logger';
import Participant from '../models/participant';
import {type DataSource} from 'typeorm';

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

export type ParticipantMiddlewareConfig = {
	createLogger: CreateLogger;
	extraLogger: CreateLogger;
	dataSource: DataSource;
};

export const createParticipantMiddleWare = (config: ParticipantMiddlewareConfig) =>
	async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
			extraLog('error', 'invalid participant code', {
				url: req.url,
				body: req.body as unknown,
				ip: req.ip,
				forwardedFor: req.headers['x-forwarded-for'],
				userAgent: req.headers['user-agent'],
				userAgentHash: hash(req.headers['user-agent'] ?? ''),
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

		const participantRepo = config.dataSource.getRepository(Participant);
		const codeExists = await participantRepo.exist({where: {code: participantCode}});

		if (!codeExists) {
			log('warning', 'participant code does not exist:', participantCode);
			bail();
			return;
		}

		req.participantCode = participantCode;
		log('info', 'participant code is valid:', participantCode);

		next();
	};

export default createParticipantMiddleWare;

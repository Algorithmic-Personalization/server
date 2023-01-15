import type express from 'express';
import {type Repository} from 'typeorm';

import {type TokenTools} from './crypto';
import {type Token} from '../models/token';
import {type CreateLogger} from './logger';

export type AuthMiddlewareConfig = {
	tokenTools: TokenTools;
	tokenRepo: Repository<Token>;
	createLogger: CreateLogger;
};

export const createAuthMiddleWare = ({createLogger, tokenTools, tokenRepo}: AuthMiddlewareConfig) =>
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		const log = createLogger(req.requestId);

		const token = req.headers.authorization!;
		log('Checking token:', token);

		if (!token) {
			log('Missing authorization header');
			res.status(401).json({kind: 'Failure', message: 'Missing authorization header', code: 'NOT_AUTHENTICATED'});
			return;
		}

		log('Verifying token');

		const check = tokenTools.verify(token);

		if (check.kind === 'Failure') {
			log('Invalid token');
			res.status(401).json({kind: 'Failure', message: 'Invalid token', code: 'NOT_AUTHENTICATED'});
			return;
		}

		log('Checking token in the database');

		(async () => {
			const tokenEntity = await tokenRepo.findOneBy({token});

			if (!tokenEntity) {
				log('Token not in the database');
				res.status(401).json({kind: 'Failure', message: 'Token not in the database', code: 'NOT_AUTHENTICATED'});
				return;
			}

			if (tokenEntity.wasInvalidated) {
				log('Token was invalidated');
				res.status(401).json({kind: 'Failure', message: 'Token was invalidated', code: 'NOT_AUTHENTICATED'});
				return;
			}

			log('Token is valid');

			req.adminId = tokenEntity.adminId;

			next();
		})();
	};

export default createAuthMiddleWare;

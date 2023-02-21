import {type RouteCreator} from '../lib/routeCreation';

import Token from '../models/token';

export const createCreateApiTokenRoute: RouteCreator = ({createLogger, dataSource, tokenTools}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('received create api token request');

	const {name} = req.body as {name: string};

	if (!name || typeof name !== 'string') {
		res.status(400).json({kind: 'Failure', message: 'Missing or invalid name'});
		return;
	}

	const {adminId} = req;

	if (!adminId || typeof adminId !== 'number') {
		res.status(401).json({kind: 'Failure', message: 'Unauthorized'});
		return;
	}

	const repo = dataSource.getRepository(Token);

	try {
		const token = new Token();
		token.token = tokenTools.sign('9999 years', adminId);
		token.adminId = adminId;
		token.name = name;
		token.api = true;

		const value = await repo.save(token);

		res.status(200).json({kind: 'Success', value});
	} catch (error) {
		log('error getting api tokens', error);

		res.status(500).json({kind: 'Error', message: 'Error getting api tokens'});
	}
};

export default createCreateApiTokenRoute;

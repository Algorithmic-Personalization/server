import {type RouteCreator} from '../lib/routeCreation';

import Token from '../models/token';

export const createDeleteApiTokenRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('received delete api token request');

	const {token} = req.params as {token: string};

	if (!token || typeof token !== 'string') {
		res.status(400).json({kind: 'Failure', message: 'Missing or invalid token'});
		return;
	}

	const {adminId} = req;

	if (!adminId || typeof adminId !== 'number') {
		res.status(401).json({kind: 'Failure', message: 'Unauthorized'});
		return;
	}

	const repo = dataSource.getRepository(Token);

	try {
		await repo.delete({token});
		res.status(200).json({kind: 'Success', value: token});
	} catch (error) {
		log('error deleting api token', error);

		res.status(500).json({kind: 'Error', message: 'Error getting api tokens'});
	}
};

export default createDeleteApiTokenRoute;

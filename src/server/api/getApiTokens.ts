import {type RouteCreator} from '../lib/routeContext';

import Token from '../models/token';

export const createGetApiTokensRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('received get api tokens request');

	const repo = dataSource.getRepository(Token);

	try {
		const value = await repo
			.find({
				where: {
					api: true,
				},
				order: {
					id: 'DESC',
				},
			});

		res.status(200).json({kind: 'Success', value});
	} catch (error) {
		log('error getting api tokens', error);

		res.status(500).json({kind: 'Error', message: 'Error getting api tokens'});
	}
};

export default createGetApiTokensRoute;

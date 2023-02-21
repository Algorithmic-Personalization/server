import {type RouteCreator} from '../lib/routeCreation';

import ExperimentConfig from '../../common/models/experimentConfig';

export const createGetExperimentConfigHistoryRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received experiment config history request');

	const repo = dataSource.getRepository(ExperimentConfig);

	const take = 30;

	try {
		const configs = await repo.find({
			take,
			order: {
				createdAt: 'DESC',
			},
			relations: ['admin'],
		});

		res.status(200).json({
			kind: 'Success',
			value: configs,
		});
	} catch (error) {
		log('Error while fetching config history:', error);
		res.status(500).json({kind: 'Failure', message: 'An error occurred while fetching the configuration history'});
	}
};

export default createGetExperimentConfigHistoryRoute;

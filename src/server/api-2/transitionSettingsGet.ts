import NotFoundError from '../lib/notFoundError';
import {type RouteDefinition} from '../lib/routeCreation';

import TransitionSetting from '../models/transitionSetting';

export const getTransitionSettingDefinition: RouteDefinition<TransitionSetting> = {
	verb: 'get',
	path: '/api/transition-setting',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<TransitionSetting> => {
		const log = createLogger(req.requestId);
		log('Received get transitionSetting request');

		const {from, to} = req.query;
		const fromNumber = Number(from);
		const toNumber = Number(to);

		if (isNaN(fromNumber) || isNaN(toNumber)) {
			throw new Error('Invalid phase numbers');
		}

		if (fromNumber < 0 || toNumber < 0) {
			throw new Error('Invalid phase numbers');
		}

		if (fromNumber > 2 || toNumber > 2) {
			throw new Error('Invalid phase numbers');
		}

		const repo = dataSource.getRepository(TransitionSetting);

		const setting = await repo.findOneBy({
			isCurrent: true,
			fromPhase: fromNumber,
			toPhase: toNumber,
		});

		if (!setting) {
			throw new NotFoundError('No transition setting found');
		}

		return setting;
	},
};

export default getTransitionSettingDefinition;

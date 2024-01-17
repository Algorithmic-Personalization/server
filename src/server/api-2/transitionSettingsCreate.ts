import {type RouteDefinition} from '../lib/routeCreation';

import TransitionSetting from '../models/transitionSetting';

import {validateNew} from '../../common/util';

export const createTransitionSettingDefinition: RouteDefinition<TransitionSetting> = {
	verb: 'post',
	path: '/api/transition-setting',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<TransitionSetting> => {
		const log = createLogger(req.requestId);
		log('Received create transitionSetting request');

		const payload = req.body as Record<string, string>;
		const setting = new TransitionSetting();
		Object.assign(setting, payload);

		const errors = await validateNew(TransitionSetting);

		if (errors.length > 0) {
			throw new Error('Invalid transitionSetting record: ' + errors.join(', '));
		}

		return dataSource.transaction(async transaction => {
			const repo = transaction.getRepository(TransitionSetting);

			const current = await repo.findOneBy({
				isCurrent: true,
				fromPhase: setting.fromPhase,
				toPhase: setting.toPhase,
			});

			if (current) {
				current.isCurrent = false;
				current.updatedAt = new Date();
				await repo.save(current);
			}

			setting.id = 0;
			setting.isCurrent = true;
			setting.createdAt = new Date();
			setting.updatedAt = new Date();

			return repo.save(setting);
		});
	},
};

export default createTransitionSettingDefinition;

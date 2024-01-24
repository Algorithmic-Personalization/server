import {type RouteDefinition} from '../lib/routeCreation';

import ChannelRotationSpeedSetting from '../models/channelRotationSpeedSetting';

const hasSpeedHours = (record: unknown): record is {speedHours: number} => {
	if (typeof record !== 'object' || record === null) {
		return false;
	}

	const {speedHours} = record as {speedHours: number};

	if (typeof speedHours !== 'number') {
		return false;
	}

	if (Number.isNaN(speedHours)) {
		return false;
	}

	return true;
};

export const channelRotationSpeedGetDefinition: RouteDefinition<ChannelRotationSpeedSetting> = {
	verb: 'post',
	path: '/api/channel-rotation-speed',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ChannelRotationSpeedSetting> => {
		const log = createLogger(req.requestId);
		log('info', 'received channel rotation speed get request');

		if (!hasSpeedHours(req.body)) {
			throw new Error('Invalid channel rotation speed');
		}

		const {speedHours} = req.body;

		const speedSetting = await dataSource.transaction(async manager => {
			await manager.update(ChannelRotationSpeedSetting, {
				isCurrent: true,
			}, {
				isCurrent: false,
				updatedAt: new Date(),
			});

			const setting = new ChannelRotationSpeedSetting();
			setting.speedHours = speedHours;
			setting.isCurrent = true;

			return manager.save(setting);
		});

		return speedSetting;
	},
};

export default channelRotationSpeedGetDefinition;

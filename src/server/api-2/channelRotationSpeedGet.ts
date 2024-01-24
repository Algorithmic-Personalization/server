import {type QueryRunner} from 'typeorm';
import {type RouteDefinition} from '../lib/routeCreation';

import ChannelRotationSpeedSetting from '../models/channelRotationSpeedSetting';

export const getRotationSpeed = async (qr: QueryRunner): Promise<ChannelRotationSpeedSetting> => {
	const speed = await qr.manager
		.getRepository(ChannelRotationSpeedSetting)
		.findOne({
			where: {
				isCurrent: true,
			},
		});

	if (!speed) {
		const defaultSpeed = new ChannelRotationSpeedSetting();
		return defaultSpeed;
	}

	return speed;
};

export const channelRotationSpeedGetDefinition: RouteDefinition<ChannelRotationSpeedSetting> = {
	verb: 'get',
	path: '/api/channel-rotation-speed',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ChannelRotationSpeedSetting> => {
		const log = createLogger(req.requestId);
		log('info', 'received channel rotation speed get request');

		const speed = await getRotationSpeed(dataSource.createQueryRunner());

		return speed;
	},
};

export default channelRotationSpeedGetDefinition;

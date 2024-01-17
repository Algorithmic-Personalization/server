import {type RouteDefinition} from '../lib/routeCreation';

import ChannelSource from '../models/channelSource';
import ChannelSourceItem from '../models/channelSourceItem';

export type InputType = {
	title?: string;
	channelIds: string[];
	isDefault?: boolean;
};

export const isInputType = (record: unknown): record is InputType => {
	if (typeof record !== 'object' || record === null) {
		return false;
	}

	const {title, channelIds, isDefault} = record as InputType;

	if (title !== undefined && typeof title !== 'string') {
		return false;
	}

	if (!Array.isArray(channelIds)) {
		return false;
	}

	if (channelIds.some(channel => typeof channel !== 'string')) {
		return false;
	}

	if (isDefault !== undefined && typeof isDefault !== 'boolean') {
		return false;
	}

	return true;
};

const createChannelSourceDefinition: RouteDefinition<ChannelSource> = {
	verb: 'post',
	path: '/api/channel-source',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ChannelSource> => {
		const log = createLogger(req.requestId);
		log('Received create channel source request');

		if (!isInputType(req.body)) {
			throw new Error('Invalid channel source record');
		}

		const {title, channelIds, isDefault} = req.body;

		const channelSource = new ChannelSource();
		channelSource.title = title;

		const res = await dataSource.transaction(async manager => {
			const defaultSource = await manager.findOne(ChannelSource, {
				where: {
					isDefault: true,
				},
			});

			if (defaultSource && isDefault) {
				defaultSource.isDefault = false;
				await manager.save(defaultSource);
			}

			if (!defaultSource) {
				channelSource.isDefault = true;
			}

			const src = await manager.save(channelSource);

			const items = channelIds.map((channelId, position) => {
				const item = new ChannelSourceItem();

				item.channelSourceId = src.id;
				item.youtubeChannelId = channelId;
				item.position = position;

				return item;
			});

			await manager.save(items);

			return src;
		});

		return res;
	},
};

export default createChannelSourceDefinition;

import {type RouteDefinition} from '../lib/routeCreation';

import ChannelSource from '../models/channelSource';
import ChannelSourceItem from '../models/channelSourceItem';
import Participant from '../models/participant';

import {
	type InputType as CreationInputType,
	isInputType as isCreationInputType,
} from './createChannelSourceDefinition';

type UpdateType = CreationInputType & {
	resetParticipantPositions?: boolean;
};

const isInputType = (record: unknown): record is UpdateType => {
	if (!isCreationInputType(record)) {
		return false;
	}

	const {resetParticipantPositions} = record as UpdateType;

	if (resetParticipantPositions !== undefined && typeof resetParticipantPositions !== 'boolean') {
		return false;
	}

	return true;
};

const createChannelSourceDefinition: RouteDefinition<ChannelSource> = {
	verb: 'post',
	path: '/api/channel-source/:id',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ChannelSource> => {
		const log = createLogger(req.requestId);
		log('Received update channel source request');

		if (!isInputType(req.body)) {
			throw new Error('Invalid channel source record');
		}

		const {id: reqId} = req.params;
		const numericId = Number(reqId);

		if (isNaN(numericId)) {
			throw new Error('Invalid channel source id');
		}

		const {title, channelIds, isDefault, resetParticipantPositions} = req.body;

		const res = await dataSource.transaction(async manager => {
			const source = await manager.findOne(ChannelSource, {
				where: {
					id: numericId,
				},
			});

			if (!source) {
				throw new Error('Channel source not found');
			}

			if (source.isDefault && !isDefault) {
				throw new Error('Cannot unset default channel source');
			}

			if (isDefault && !source.isDefault) {
				await manager.update(ChannelSource, {
					isDefault: true,
				}, {
					isDefault: false,
				});

				source.isDefault = true;

				if (title) {
					source.title = title;
				}

				source.updatedAt = new Date();

				await manager.save(source);
			}

			await manager.delete(ChannelSourceItem, {
				channelSourceId: numericId,
			});

			const items = channelIds.map((channelId, position) => {
				const item = new ChannelSourceItem();

				item.channelSourceId = numericId;
				item.youtubeChannelId = channelId;
				item.position = position;

				return item;
			});

			await manager.save(items);

			if (resetParticipantPositions) {
				if (source.isDefault) {
					await manager.update(Participant, {
						channelSourceId: null,
					}, {
						posInChannelSource: 0,
						posInChannelSourceLastUpdatedAt: new Date(),
					});
				} else {
					await manager.update(Participant, {
						channelSourceId: numericId,
					}, {
						posInChannelSource: 0,
						posInChannelSourceLastUpdatedAt: new Date(),
					});
				}
			}

			return manager.findOne(ChannelSource, {
				where: {
					id: numericId,
				},
			});
		});

		if (!res) {
			throw new Error('Channel source not found - this should never happen');
		}

		return res;
	},
};

export default createChannelSourceDefinition;

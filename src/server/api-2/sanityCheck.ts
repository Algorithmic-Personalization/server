import {type RouteDefinition} from '../lib/routeCreation';
import {VideoListItem, ListType} from './../models/videoListItem';

import Event, {EventType} from '../../common/models/event';

export type SanityCheck = {
	nHomeShownEvents: number;
	nWeirdHomeShownEvents: number;
};

export const createSanityCheckDefinition: RouteDefinition<SanityCheck> = {
	verb: 'get',
	path: '/api/sanity-check',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<SanityCheck> => {
		const log = createLogger(req.requestId);
		log('received sanity check request');

		const checkPhaseOneEvent = async (event: Event): Promise<boolean> => {
			const items = await dataSource.getRepository(VideoListItem).find({
				where: {
					eventId: event.id,
				},
				order: {
					listType: 'ASC',
					position: 'ASC',
				},
			});

			const def: VideoListItem[] = [];
			const extSrc: VideoListItem[] = [];
			const shown: VideoListItem[] = [];

			for (const item of items) {
				switch (item.listType) {
					case ListType.HOME_DEFAULT:
						def.push(item);
						break;
					case ListType.HOME_REPLACEMENT_SOURCE:
						extSrc.push(item);
						break;
					case ListType.HOME_SHOWN:
						shown.push(item);
						break;
					default:
						throw new Error(`Unexpected list type: ${item.listType}`);
				}
			}

			for (const item of def) {
				const {position} = item;
				if (shown.length <= position) {
					log('error', `event ${event.id} has a HOME_DEFAULT item at position ${position} but only ${shown.length} HOME_SHOWN items`);
					return false;
				}

				const shownItem = shown[position + 3];

				if (shownItem.videoId !== item.videoId) {
					log('error', `event ${event.id} has a HOME_DEFAULT item at position ${position} with video ${item.videoId} but HOME_SHOWN item at position ${position + 3} has video ${shownItem.videoId}`);
					return false;
				}
			}

			return true;
		};

		const eventRepo = dataSource.getRepository(Event);

		const homeShownEvents = await eventRepo.find({
			where: {
				type: EventType.HOME_SHOWN,
				phase: 1,
				extensionVersion: '3.5.0',
			},
		});

		const phaseOneOk = await Promise.all(homeShownEvents.map(checkPhaseOneEvent));

		const nHomeShownEvents = homeShownEvents.length;
		const nWeirdHomeShownEvents = phaseOneOk.filter(ok => !ok).length;

		return {
			nHomeShownEvents,
			nWeirdHomeShownEvents,
		};
	},
};

export default createSanityCheckDefinition;

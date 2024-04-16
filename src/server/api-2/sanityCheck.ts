import {type RouteDefinition} from '../lib/routeCreation';

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

		const eventRepo = dataSource.getRepository(Event);

		const homeShownEvents = await eventRepo.find({
			where: {
				type: EventType.HOME_SHOWN,
				phase: 1,
			},
		});

		const nHomeShownEvents = homeShownEvents.length;
		const nWeirdHomeShownEvents = 0;

		return {
			nHomeShownEvents,
			nWeirdHomeShownEvents,
		};
	},
};

export default createSanityCheckDefinition;

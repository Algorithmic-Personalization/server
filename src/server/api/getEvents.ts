import {type RouteCreator} from '../lib/routeContext';

import Event from '../models/event';

import {type Page, extractPaginationRequest} from '../lib/pagination';

export const createGetEventsRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('received get event request');

	const repo = dataSource.getRepository(Event);

	const {page, pageSize} = extractPaginationRequest(req);

	try {
		const results = await repo
			.find({
				skip: page * pageSize,
				take: pageSize,
				order: {
					createdAt: 'DESC',
				},
			});

		const count = await repo.count();

		const data: Page<Event> = {
			results,
			page,
			pageSize,
			pageCount: Math.ceil(count / pageSize),
		};

		res.status(200).json({kind: 'Success', value: data});
	} catch (error) {
		log('Error getting events', error);

		res.status(500).json({kind: 'Error', value: 'Error getting events'});
	}
};

export default createGetEventsRoute;

import {type RouteCreator} from '../lib/routeContext';

import Participant from '../models/participant';

export const createPostCheckParticipantCodeRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received check participant code request');

	const {code} = req.body as Record<string, string>;

	if (code === undefined) {
		res.status(400).send('Missing participant code');
		return;
	}

	const repo = dataSource.getRepository(Participant);

	const exists = await repo.findOneBy({
		code,
	});

	if (!exists) {
		res.status(400).json({kind: 'Failure', message: 'Invalid participant code'});
		return;
	}

	res.status(200).json({kind: 'Success', value: 'Participant code is valid'});
};

export default createPostCheckParticipantCodeRoute;

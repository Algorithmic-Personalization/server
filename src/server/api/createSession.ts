import {type RouteCreator} from '../lib/routeContext';

import Session from '../../common/models/session';

export const createCreateSessionRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	const code = req.participantCode;

	log('Received create session request for participant code:', code);

	if (code === undefined) {
		res.status(400).json({kind: 'Failure', message: 'Missing participant code'});
		return;
	}

	const repo = dataSource.getRepository(Session);

	const session = new Session();
	session.participantCode = code;

	try {
		const saved = await repo.save(session);
		res.send({kind: 'Success', value: saved});
	} catch (error) {
		log('Failed to create session:', error);
		res.status(500).json({kind: 'Failure', message: 'Failed to create session'});
	}
};

export default createCreateSessionRoute;

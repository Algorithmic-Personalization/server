import {type RouteCreator} from '../lib/routeContext';

import {isParticipantRecord} from '../lib/participant';
import Participant from '../models/participant';

export const createCreateParticipantRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received create participant request');

	const participant = req.body as Record<string, string>;

	if (!isParticipantRecord(participant)) {
		log('invalid participant:', participant);
		res.status(400).json({kind: 'Failure', message: 'Invalid participant'});
		return;
	}

	const participantRepo = dataSource.getRepository(Participant);

	const participantEntity = new Participant();
	Object.assign(participantEntity, participant);

	try {
		const value = await participantRepo.save(participantEntity);
		res.status(200).json({kind: 'Success', value});
	} catch (error) {
		log('error:', error);
		res.status(500).json({kind: 'Failure', message: 'Error creating participant'});
	}
};

export default createCreateParticipantRoute;

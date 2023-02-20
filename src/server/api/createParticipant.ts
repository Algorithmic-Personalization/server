import {type RouteBuilder} from '../lib/routeContext';

import {isParticipantRecord} from '../lib/participant';
import Participant from '../models/participant';

export const buildParticipantRoute: RouteBuilder<Participant> = ({createLogger, dataSource}) => async (req): Promise<Participant> => {
	const log = createLogger(req.requestId);
	log('Received create participant request');

	const participant = req.body as Record<string, string>;

	if (!isParticipantRecord(participant)) {
		throw new Error('Invalid participant record');
	}

	const participantRepo = dataSource.getRepository(Participant);

	const participantEntity = new Participant();
	Object.assign(participantEntity, participant);

	return participantRepo.save(participantEntity);
};

export default buildParticipantRoute;

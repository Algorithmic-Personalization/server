import {type RouteDefinition} from '../lib/routeCreation';

import {isParticipantRecord} from '../lib/participant';
import Participant from '../models/participant';

export const createParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'post',
	path: '/api/participant',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received create participant request');

		const {id: _unused, ...participant} = req.body as Record<string, string>;

		if (!isParticipantRecord(participant)) {
			throw new Error('Invalid participant record');
		}

		const participantRepo = dataSource.getRepository(Participant);

		if (await participantRepo.findOneBy({email: participant.email})) {
			throw new Error('Participant with that email already exists');
		}

		const participantEntity = new Participant();

		Object.assign(participantEntity, participant);

		return participantRepo.save(participantEntity);
	},
};

export default createParticipantDefinition;

import {type RouteDefinition} from '../lib/routeCreation';

import {isParticipantRecord} from '../lib/participant';
import Participant from '../models/participant';

export const createParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'post',
	path: '/api/participant',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received create participant request');

		const {id: _unused, ...participantPayload} = req.body as Record<string, string>;

		if (!isParticipantRecord(participantPayload)) {
			throw new Error('Invalid participant record');
		}

		const participantRepo = dataSource.getRepository(Participant);

		if (await participantRepo.findOneBy({code: participantPayload.code})) {
			throw new Error('Participant with that code already exists, use the update endpoint (PUT method) if you want to update it');
		}

		const participantEntity = new Participant();

		Object.assign(participantEntity, participantPayload);

		return participantRepo.save(participantEntity);
	},
};

export default createParticipantDefinition;

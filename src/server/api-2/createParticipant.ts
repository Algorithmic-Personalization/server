import {type RouteDefinition} from '../lib/routeCreation';

import {isParticipantRecord} from '../lib/participant';
import Participant from '../models/participant';
import {has} from '../../common/util';

export type ParticipantData = {
	arm: 'control' | 'treatment' | 0 | 1;
	code: string;
};

export const isParticipantData = (record: Record<string, string | number>): record is ParticipantData =>
	has('code')(record)
	&& has('arm')(record)
	&& typeof record.code === 'string'
	&& record.code.length > 0
	&& (
		record.arm === 'control'
		|| record.arm === 'treatment'
		|| record.arm === 0
		|| record.arm === 1
	);

export const createParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'post',
	path: '/api/participant',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received create participant request');

		const {id: _unused, ...participantData} = req.body as Record<string, string>;

		if (!isParticipantData(participantData)) {
			throw new Error('Invalid participant record');
		}

		const participantRepo = dataSource.getRepository(Participant);

		if (await participantRepo.findOneBy({code: participantData.code})) {
			throw new Error('Participant with that code already exists, use the update endpoint (PUT method) if you want to update it');
		}

		const participantEntity = new Participant();

		if (participantData.arm === 0) {
			participantData.arm = 'control';
		} else if (participantData.arm === 1) {
			participantData.arm = 'treatment';
		}

		Object.assign(participantEntity, participantData);

		return participantRepo.save(participantEntity);
	},
};

export default createParticipantDefinition;

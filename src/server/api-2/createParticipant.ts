import {type RouteDefinition} from '../lib/routeCreation';

import Participant from '../models/participant';
import {has} from '../../common/util';
import {ExperimentArm} from '../../common/models/event';

export type ParticipantData = {
	arm: 'control' | 'treatment' | 0 | 1;
	code: string;
};

export const isParticipantData = (record: Record<string, string | number>): record is ParticipantData =>
	has('code')(record)
	&& typeof record.code === 'string'
	&& record.code.length > 0;

export const createParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'post',
	path: '/api/participant',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received create participant request');

		const {id: _unused, ...participantData} = req.body as Record<string, string>;

		log('info', 'new participant data', participantData);

		if (!isParticipantData(participantData)) {
			throw new Error('Invalid participant record');
		}

		const participantRepo = dataSource.getRepository(Participant);

		if (await participantRepo.findOneBy({code: participantData.code})) {
			throw new Error('Participant with that code already exists, use the update endpoint (PUT method) if you want to update it');
		}

		const participantEntity = new Participant();

		if (!participantData.arm || participantData.arm === ExperimentArm.CONTROL) {
			participantData.arm = ExperimentArm.CONTROL;
		} else if (participantData.arm === 1 || participantData.arm === 'treatment') {
			participantData.arm = ExperimentArm.TREATMENT;
		} else {
			log('warning', 'invalid participant arm', participantData);
			throw new Error('invalid participant arm');
		}

		participantEntity.arm = participantData.arm as ExperimentArm;
		participantEntity.code = participantData.code;

		return participantRepo.save(participantEntity);
	},
};

export default createParticipantDefinition;

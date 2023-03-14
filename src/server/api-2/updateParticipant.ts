import {type DataSource} from 'typeorm';

import {type RouteDefinition} from '../lib/routeCreation';
import {type LogFunction} from '../lib/logger';

import Participant, {isValidPhase} from '../models/participant';
import {isValidExperimentArm} from '../../common/models/event';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';
import TransitionSetting from '../models/transitionSetting';

import {daysElapsed} from '../../util';

const updateParticipantPhase = (dataSource: DataSource, log: LogFunction) =>
	async (participant: Participant, fromPhase: number, toPhase: number): Promise<Participant> => {
		if (fromPhase === toPhase) {
			return participant;
		}

		const latestTransition = await dataSource
			.getRepository(TransitionEvent)
			.findOne({
				where: {
					participantId: participant.id,
				},
				order: {
					createdAt: 'DESC',
				},
			});

		const startOfLatestPhase = latestTransition?.createdAt ?? participant.createdAt;

		if (latestTransition) {
			log('latest transition for participant', latestTransition);
		} else {
			log(
				'no previous transition for participant, using is creation date as entry into previous phase',
				startOfLatestPhase,
			);
		}

		const transition = new TransitionEvent();
		transition.fromPhase = fromPhase;
		transition.toPhase = toPhase;
		transition.participantId = participant.id;
		transition.reason = TransitionReason.FORCED;
		transition.numDays = daysElapsed(startOfLatestPhase, new Date());

		const setting = await dataSource
			.getRepository(TransitionSetting)
			.findOneBy({
				fromPhase,
				toPhase,
				isCurrent: true,
			});

		if (!setting) {
			log('no transition setting found for that phase transition');
			throw new Error('No transition setting found for that phase transition');
		}

		transition.transitionSettingId = setting.id;

		return dataSource.transaction(async manager => {
			log('saving transition', transition);
			await manager.save(transition);
			participant.phase = toPhase;
			await manager.save(participant);
			return participant;
		});
	};

export const updateParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'put',
	path: '/api/participant/:email',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received update participant request');

		const {id: _unused, phase, arm} = req.body as Record<string, string | number>;
		const {email} = req.params;

		if (!email || typeof email !== 'string') {
			throw new Error('Invalid participant email');
		}

		const participantRepo = dataSource.getRepository(Participant);

		const participantEntity = await participantRepo.findOneBy({email});

		if (!participantEntity) {
			throw new Error('Participant with that email does not exist');
		}

		const {phase: previousPhase} = participantEntity;

		if (isValidExperimentArm(arm)) {
			participantEntity.arm = arm;
		}

		if (isValidPhase(phase)) {
			return updateParticipantPhase(dataSource, log)(
				participantEntity, previousPhase, phase,
			);
		}

		return participantRepo.save(participantEntity);
	},
};

export default updateParticipantDefinition;

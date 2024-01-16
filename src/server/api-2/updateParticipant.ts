import {type DataSource} from 'typeorm';

import {type RouteDefinition} from '../lib/routeCreation';
import {type LogFunction} from '../lib/logger';

import Participant, {isValidPhase} from '../models/participant';
import {isValidExperimentArm} from '../../common/models/event';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';

import {daysElapsed} from '../../util';

import {type ExternalNotifier} from '../lib/externalNotifier';
import {createSaveParticipantTransition} from '../lib/participant';

const updateParticipantPhase = (
	dataSource: DataSource,
	notifier: ExternalNotifier,
	log: LogFunction,
) =>
	(fromPhase: number, toPhase: number) =>
		async (participant: Participant): Promise<void> => {
			if (fromPhase === toPhase) {
				return undefined;
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

			const saveParticipantTransition = createSaveParticipantTransition({
				dataSource,
				log,
				notifier: notifier.makeParticipantNotifier({
					participantCode: participant.code,
					participantId: participant.id,
					isPaid: participant.isPaid,
				}),
			});

			await saveParticipantTransition(participant, transition, undefined);
		};

export const updateParticipantDefinition: RouteDefinition<Participant> = {
	verb: 'put',
	path: '/api/participant/:code',
	makeHandler: ({createLogger, dataSource, notifier}) => async (req): Promise<Participant> => {
		const log = createLogger(req.requestId);
		log('Received update participant request');

		const {id: _unused, phase, arm, isPaid, channelSourceId, posInChannelSource} = req.body as Record<string, string | number>;
		const {code} = req.params;

		if (!code || typeof code !== 'string') {
			throw new Error('Invalid participant email');
		}

		const participantRepo = dataSource.getRepository(Participant);

		const participantEntity = await participantRepo.findOneBy({code});

		if (!participantEntity) {
			throw new Error('Participant with that email does not exist');
		}

		const {phase: previousPhase} = participantEntity;

		if (isValidExperimentArm(arm)) {
			participantEntity.arm = arm;
		}

		participantEntity.isPaid = isPaid === 1;

		if (phase && !isValidPhase(phase)) {
			throw new Error('Invalid phase, must be one of: 0, 1, 2');
		}

		if (typeof channelSourceId === 'number') {
			participantEntity.channelSourceId = channelSourceId;
		} else if (channelSourceId !== undefined) {
			throw new Error('Invalid channel source id, must be a number');
		}

		if (typeof posInChannelSource === 'number') {
			participantEntity.posInChannelSource = posInChannelSource;
			participantEntity.posInChannelSourceLastUpdatedAt = new Date();
		}

		participantEntity.updatedAt = new Date();

		const out = await participantRepo.save(participantEntity);

		if (isValidPhase(phase)) {
			await updateParticipantPhase(dataSource, notifier, log)(
				previousPhase, phase,
			)(
				participantEntity,
			);

			out.phase = phase;
		}

		return out;
	},
};

export default updateParticipantDefinition;

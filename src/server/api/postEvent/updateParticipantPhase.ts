import {type DataSource, MoreThan} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import type Participant from '../../models/participant';
import {type Event} from '../../../common/models/event';
import DailyActivityTime from '../../models/dailyActivityTime';
import TransitionSetting, {Phase} from '../../models/transitionSetting';
import TransitionEvent, {TransitionReason} from '../../models/transitionEvent';
import {shouldTriggerPhaseTransition} from '../postEvent';
import {type ExternalNotifier} from '../../lib/externalNotifier';
import {createSaveParticipantTransition} from '../../lib/participant';

export const createUpdatePhase = ({
	dataSource, notifier, log,
}: {
	dataSource: DataSource;
	notifier: ExternalNotifier;
	log: LogFunction;
}) => async (participant: Participant, latestEvent: Event) => {
	log('updating participant phase if needed...');

	if (participant.phase === Phase.POST_EXPERIMENT) {
		log('participant in post-experiment, no need to check for phase transition, skipping');
		return;
	}

	// Find the right transition settings to apply
	const fromPhase = participant.phase;
	const toPhase = fromPhase === Phase.PRE_EXPERIMENT
		? Phase.EXPERIMENT
		: Phase.POST_EXPERIMENT;

	const transitionSettingRepo = dataSource.getRepository(TransitionSetting);

	const setting = await transitionSettingRepo.findOneBy({
		fromPhase,
		toPhase,
		isCurrent: true,
	});

	if (!setting) {
		log('/!\\ no transition setting from', fromPhase, 'to', toPhase, 'found, skipping - this is probably a bug or a misconfiguration');
		return;
	}

	log('transition setting from phase', fromPhase, 'to phase', toPhase, 'found:', setting);

	// Find the entry date of participant in the phase they're currently in
	const transitionRepo = dataSource.getRepository(TransitionEvent);

	const latestTransition = await transitionRepo.findOne({
		where: {
			toPhase: participant.phase,
			participantId: participant.id,
		},
		order: {
			id: 'DESC',
		},
	});

	const entryDate = latestTransition ? latestTransition.createdAt : participant.createdAt;

	// Get all statistics for the participant after entry into current phase
	const activityRepo = dataSource.getRepository(DailyActivityTime);

	const activities = await activityRepo.find({
		where: {
			participantId: participant.id,
			createdAt: MoreThan(entryDate),
		},
	});

	log('found', activities.length, 'activities for participant', participant.id, 'after entry date', entryDate, 'into phase', participant.phase);

	const transitionEvent = shouldTriggerPhaseTransition(setting, activities);

	if (transitionEvent) {
		log('triggering transition from phase', fromPhase, 'to phase', toPhase);

		transitionEvent.participantId = participant.id;
		transitionEvent.fromPhase = fromPhase;
		transitionEvent.toPhase = toPhase;
		transitionEvent.reason = TransitionReason.AUTOMATIC;
		transitionEvent.transitionSettingId = setting.id;
		transitionEvent.eventId = latestEvent.id;

		const saveParticipantTransition = createSaveParticipantTransition({
			dataSource,
			notifier: notifier.makeParticipantNotifier({
				participantCode: participant.code,
				participantId: participant.id,
				isPaid: participant.isPaid,
			}),
			log,
		});

		participant.phase = toPhase;

		await saveParticipantTransition(participant, transitionEvent, latestEvent);
	}
};

export default createUpdatePhase;

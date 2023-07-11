import {type DataSource, MoreThan} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import type Participant from '../../models/participant';
import Event, {EventType} from '../../../common/models/event';
import DailyActivityTime from '../../models/dailyActivityTime';
import TransitionSetting, {Phase} from '../../models/transitionSetting';
import TransitionEvent, {TransitionReason} from '../../models/transitionEvent';
import {shouldTriggerPhaseTransition} from '../postEvent';
import {createExternalNotifier} from '../../lib/externalNotifier';

export const createUpdatePhase = ({
	dataSource, log,
}: {
	dataSource: DataSource;
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

		const triggerEvent = new Event();
		Object.assign(triggerEvent, latestEvent, {
			id: 0,
			type: EventType.PHASE_TRANSITION,
		});

		transitionEvent.participantId = participant.id;
		transitionEvent.fromPhase = fromPhase;
		transitionEvent.toPhase = toPhase;
		transitionEvent.reason = TransitionReason.AUTOMATIC;
		transitionEvent.transitionSettingId = setting.id;

		participant.phase = toPhase;

		await dataSource.transaction(async manager => {
			const trigger = await manager.save(triggerEvent);
			transitionEvent.eventId = trigger.id;
			await Promise.all([
				manager.save(transitionEvent),
				manager.save(participant),
			]);
		});

		if (toPhase === Phase.EXPERIMENT) {
			const notifier = createExternalNotifier(
				participant.code,
				log,
			);

			void notifier.notifyInterventionPeriod(latestEvent.createdAt);
		}
	} else {
		log('no phase transition needed at this point');
	}
};

export default createUpdatePhase;

import {type DataSource} from 'typeorm';

import type Participant from '../models/participant';
import {has} from '../../common/util';
import {type ParticipantActivityHandler} from './externalNotifier';
import type TransitionEvent from '../models/transitionEvent';

export type ParticipantRecord = {
	email: string;
	code: string;
	arm: 'control' | 'treatment';
};

export const isParticipantRecord = (record: Record<string, string>): record is ParticipantRecord =>
	has('code')(record)
	&& has('arm')(record)
	&& typeof record.code === 'string'
	&& record.code.length > 0
	&& (record.arm === 'control' || record.arm === 'treatment');

export const createSaveParticipantTransition = ({
	dataSource,
	notifier,
}: {
	dataSource: DataSource;
	notifier: ParticipantActivityHandler;
}) => async (
	participant: Participant,
	transition: TransitionEvent,
): Promise<Participant> =>
	dataSource.transaction(async manager => {
		participant.phase = transition.toPhase;

		const [updatedParticipant] = await Promise.all([
			manager.save(participant),
			manager.save(transition),
		]);

		await notifier.onPhaseChange(
			transition.createdAt,
			transition.fromPhase,
			transition.toPhase,
		);

		return updatedParticipant;
	});

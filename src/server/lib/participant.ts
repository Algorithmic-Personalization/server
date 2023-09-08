import {type DataSource} from 'typeorm';

import type Participant from '../models/participant';
import {has} from '../../common/util';
import {type ParticipantActivityHandler} from './externalNotifier';
import TransitionEvent from '../models/transitionEvent';
import type Event from '../../common/models/event';

export type ParticipantRecord = {
	email: string;
	code: string;
	arm: 'control' | 'treatment';
	isPaid: 1 | undefined;
};

export const isParticipantRecord = (record: Record<string, string | number | undefined>): record is ParticipantRecord =>
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
	triggerEvent: Event | undefined,
): Promise<TransitionEvent | undefined> => {
	const qr = dataSource.createQueryRunner();

	const proceedToUpdate = async () => {
		const updatedTransition = new TransitionEvent();
		Object.assign(updatedTransition, transition, {
			eventId: triggerEvent ? triggerEvent.id : undefined,
		});

		const [, savedTransitionEvent] = await Promise.all([
			qr.manager.save(participant),
			qr.manager.save(updatedTransition),
		]);

		await notifier.onPhaseChange(
			transition.createdAt,
			transition.fromPhase,
			transition.toPhase,
		);

		return savedTransitionEvent;
	};

	try {
		await qr.startTransaction();
		const repo = qr.manager.getRepository(TransitionEvent);
		const latestExistingTransition = await repo
			.createQueryBuilder('t')
			.useTransaction(true)
			.setLock('pessimistic_write_or_fail')
			.where({
				participantId: participant.id,
				fromPhase: transition.fromPhase,
				toPhase: transition.toPhase,
			})
			.orderBy({
				id: 'DESC',
			})
			.getOne();

		console.log('latestExistingTransition', latestExistingTransition);

		const minutes5 = 1000 * 60 * 5;

		// The latest transition is too recent, don't save
		if (latestExistingTransition && Date.now() - latestExistingTransition.createdAt.getTime() < minutes5) {
			return;
		}

		const p = await proceedToUpdate();

		return p;
	} catch (error) {
		await qr.rollbackTransaction();
		throw error;
	} finally {
		await qr.release();
	}
};

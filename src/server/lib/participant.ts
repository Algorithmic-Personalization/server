import {type DataSource} from 'typeorm';

import Participant from '../models/participant';
import {has} from '../../common/util';
import {type ParticipantActivityHandler} from './externalNotifier';
import TransitionEvent from '../models/transitionEvent';
import type Event from '../../common/models/event';
import {type LogFunction} from './logger';

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
	log,
}: {
	dataSource: DataSource;
	notifier: ParticipantActivityHandler;
	log: LogFunction;
}) => async (
	participant: Participant,
	transition: TransitionEvent,
	triggerEvent: Event | undefined,
): Promise<TransitionEvent | undefined> => {
	log('info', 'transition to save:', transition);

	const qr = dataSource.createQueryRunner();
	await qr.connect();

	const proceedToUpdate = async () => {
		log('info', 'proceed to update of phase...');

		const updatedTransition = new TransitionEvent();
		Object.assign(updatedTransition, transition, {
			eventId: triggerEvent ? triggerEvent.id : undefined,
			participantId: participant.id,
		});

		const [, savedTransitionEvent] = await Promise.all([
			qr.manager.save(Participant, {
				...participant,
				phase: transition.toPhase,
			}),
			qr.manager.save(updatedTransition, {
				transaction: false,
			}),
		]);

		await qr.commitTransaction();

		await notifier.onPhaseChange(
			transition.createdAt,
			transition.fromPhase,
			transition.toPhase,
		);

		return savedTransitionEvent;
	};

	try {
		log('info', 'starting transaction...');
		await qr.startTransaction('SERIALIZABLE');
		const repo = qr.manager.getRepository(TransitionEvent);
		const latestExistingTransition = await repo
			.createQueryBuilder()
			.useTransaction(true)
			.setLock('pessimistic_write_or_fail')
			.where({
				participantId: participant.id,
			})
			.orderBy({
				id: 'DESC',
			})
			.getOne();

		if (latestExistingTransition) {
			if (
				latestExistingTransition.fromPhase === transition.fromPhase
				&& latestExistingTransition.toPhase === transition.toPhase
			) {
				log('info', 'transition already exists, skipping');
				// No need to update
				return;
			}
		}

		const p = await proceedToUpdate();
		await qr.commitTransaction();

		log('success', 'transition from', transition.fromPhase, 'to', transition.toPhase, 'saved');

		return p;
	} catch (error) {
		if (qr.isTransactionActive) {
			await qr.rollbackTransaction();
		}

		log('error', 'failed to save transition', error);

		throw error;
	} finally {
		await qr.release();
	}
};

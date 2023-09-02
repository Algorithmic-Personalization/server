import {type DataSource} from 'typeorm';

import Participant from '../../models/participant';

import {type LogFunction} from '../../lib/logger';
import {type ParticipantActivityHandler} from '../../lib/externalNotifier';

import Event, {EventType} from '../../../common/models/event';

export const createHandleExtensionInstalledEvent = ({
	dataSource,
	notifier,
	log,
}: {
	dataSource: DataSource;
	notifier: ParticipantActivityHandler;
	log: LogFunction;
}) => async (p: Participant, triggerEvent: Event) => {
	log('handling extension installed event...');
	if (p.extensionInstalled) {
		log('info', 'participant extension already installed, skipping with no lookup');
		return;
	}

	log('info', 'initiating the transaction business...');
	const queryRunner = dataSource.createQueryRunner();

	try {
		await queryRunner.startTransaction();
		const participantRepo = queryRunner.manager.getRepository(Participant);
		const participant = await participantRepo
			.createQueryBuilder('participant')
			.useTransaction(true)
			.setLock('pessimistic_write_or_fail')
			.where({id: p.id})
			.getOne();

		if (!participant) {
			throw new Error('Participant not found');
		}

		if (participant.extensionInstalled) {
			log('info', 'participant extension already installed, skipping');
		} else {
			log('info', 'participant extension not installed, calling API to notify installation...');
			log('remote server notified, updating local participant...');

			participant.extensionInstalled = true;
			const installEvent = new Event();

			const eventRepo = queryRunner.manager.getRepository(Event);

			Object.assign(installEvent, triggerEvent, {
				type: EventType.EXTENSION_INSTALLED,
				localUuid: installEvent.localUuid,
				id: 0,
			});

			await eventRepo.save(installEvent);
			await queryRunner.manager.save(participant);
			await queryRunner.commitTransaction();
			log('participant updated, transaction committed');
			await notifier.onInstalled(triggerEvent.createdAt);
		}
	} catch (err) {
		log('error', 'handling EXTENSION_INSTALLED event', err);
		await queryRunner.rollbackTransaction();
	} finally {
		await queryRunner.release();
	}
};

export default createHandleExtensionInstalledEvent;

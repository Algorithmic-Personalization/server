import {type DataSource} from 'typeorm';

import Participant from '../../models/participant';
import Event from '../../../common/models/event';

import {type LogFunction} from '../../lib/logger';
import {type ParticipantActivityHandler} from '../../lib/externalNotifier';

export const createHandleExtensionInstalledEvent = ({
	dataSource,
	notifier,
	log,
}: {
	dataSource: DataSource;
	notifier: ParticipantActivityHandler;
	log: LogFunction;
}) => async (p: Participant, event: Event) => {
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
			.setLock('pessimistic_read')
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
			await queryRunner.manager.save(participant);
			const eventRepo = queryRunner.manager.getRepository(Event);
			const e = await eventRepo.save(event);
			log('event saved', e);
			await queryRunner.commitTransaction();
			log('participant updated, transaction committed');
			await notifier.onInstalled(event.createdAt);
		}
	} catch (err) {
		log('error', 'handling EXTENSION_INSTALLED event', err);
		await queryRunner.rollbackTransaction();
	} finally {
		await queryRunner.release();
	}
};

export default createHandleExtensionInstalledEvent;

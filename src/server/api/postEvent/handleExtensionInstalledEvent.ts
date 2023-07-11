import {type DataSource} from 'typeorm';

import Participant from '../../models/participant';
import Event from '../../../common/models/event';

import {type LogFunction} from '../../lib/logger';
import {type ExternalNotifier} from '../../lib/loadExternalNotifier';

export const createHandleExtensionInstalledEvent = (
	dataSource: DataSource,
	notifier: ExternalNotifier,
	log: LogFunction,
) => async (participantId: number, event: Event) => {
	log('handling extension installed event...');
	const eventRepo = dataSource.getRepository(Event);
	const queryRunner = dataSource.createQueryRunner();

	try {
		await queryRunner.startTransaction();
		const participant = await queryRunner.manager.getRepository(Participant)
			.createQueryBuilder('participant')
			.useTransaction(true)
			.setLock('pessimistic_write')
			.where({id: participantId})
			.getOne();

		if (!participant) {
			throw new Error('Participant not found');
		}

		if (participant.extensionInstalled) {
			log('participant extension already installed, skipping');
		} else {
			log('participant extension not installed, calling API to notify installation...');
			const n = notifier.makeParticipantNotifier({participantCode: participant.code});
			void n.notifyInstalled(event.createdAt);
			log('remote server notified, updating local participant...');
			participant.extensionInstalled = true;
			await queryRunner.manager.save(participant);
			const e = await eventRepo.save(event);
			log('event saved', e);
			await queryRunner.commitTransaction();
			log('participant updated, transaction committed');
		}
	} catch (err) {
		log('error handling EXTENSION_INSTALLED event:', err);
		await queryRunner.rollbackTransaction();
	} finally {
		await queryRunner.release();
	}
};

export default createHandleExtensionInstalledEvent;

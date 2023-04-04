import fetch from 'node-fetch';

import {type DataSource} from 'typeorm';

import Participant from '../../models/participant';
import Event from '../../../common/models/event';

import {type InstalledEventConfig} from '../../lib/routeCreation';
import {type LogFunction} from '../../lib/logger';

export const createHandleExtensionInstalledEvent = (
	dataSource: DataSource,
	installedEventConfig: InstalledEventConfig,
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
			await fetch(installedEventConfig.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-TOKEN': installedEventConfig.token,
				},
				body: JSON.stringify({
					code: participant.code,
				}),
			});

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

import {type DataSource} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import Participant from '../../models/participant';
import Event from '../../../common/models/event';
import {EventType} from '../../../common/models/event';
import {type ParticipantActivityNotifier} from '../../lib/externalNotifier';

export const createActivateExtension = ({
	dataSource, activityNotifier, log,
}: {
	dataSource: DataSource;
	activityNotifier: ParticipantActivityNotifier;
	log: LogFunction;
}) => async (event: Event, participant: Participant) => {
	const qr = dataSource.createQueryRunner();

	try {
		await qr.startTransaction();
		const repo = qr.manager.getRepository(Participant);
		const p = await repo
			.createQueryBuilder('participant')
			.useTransaction(true)
			.setLock('pessimistic_write')
			.where({id: participant.id})
			.getOne();

		if (p === null) {
			throw new Error('Participant not found');
		}

		const activationEvent = new Event();
		Object.assign(
			activationEvent,
			event,
			{
				type: EventType.EXTENSION_ACTIVATED,
				id: 0,
				localUuid: activationEvent.localUuid,
			},
		);

		p.extensionActivatedAt = new Date();
		const [savedEvent] = await Promise.all([
			qr.manager.save(activationEvent),
			qr.manager.save(p),
		]);

		await qr.commitTransaction();

		log(
			'success',
			`Participant ${participant.id} activated extension, the following event was saved:`,
			savedEvent,
		);

		void activityNotifier.notifyActive(activationEvent.createdAt);
	} catch (err) {
		log('error', 'while handling extension activity status determination or saving:', err);
		await qr.rollbackTransaction();
	} finally {
		await qr.release();
	}
};

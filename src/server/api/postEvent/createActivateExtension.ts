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
}) => async (event: Event, participant: Participant): Promise<boolean> => {
	const qr = dataSource.createQueryRunner();

	try {
		await qr.startTransaction();
		const repo = qr.manager.getRepository(Participant);
		const p = await repo
			.createQueryBuilder('participant')
			.useTransaction(true)
			.setLock('pessimistic_read')
			.where({id: participant.id})
			.getOne();

		if (p === null) {
			throw new Error('Participant not found');
		}

		if (p.extensionActivatedAt !== null) {
			log('info', `Participant ${participant.id} already activated extension`);
			return false;
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

		const ok = await activityNotifier.notifyActive(activationEvent.createdAt);
		return ok;
	} catch (err) {
		log('error', 'while handling extension activity status determination or saving:', err);
		await qr.rollbackTransaction();
		return false;
	} finally {
		log('debug', 'releasing query runner');
		await qr.release();
	}
};

import type {DataSource} from 'typeorm';
import type {LogFunction} from './logger';
import Participant from '../models/participant';

import {inspect} from 'util';

export const updateCounters = async ({
	log,
	dataSource,
}: {
	log: LogFunction;
	dataSource: DataSource;
}) => {
	log('Updating counters...');

	const participants: Array<{id: number}> = await dataSource
		.getRepository(Participant)
		.createQueryBuilder('participant')
		.leftJoinAndSelect(
			'daily_activity_time',
			'dat',
			'dat.participant_id=participant.id and dat.participant_id=participant.id is null',
		)
		.select('distinct participant.id', 'id')
		.getRawMany();

	log(`Found ${inspect(participants)} participants to update`);
};

export default updateCounters;

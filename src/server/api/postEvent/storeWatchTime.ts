import {type DataSource} from 'typeorm';
import {type LogFunction} from '../../lib/logger';
import {type WatchTimeEvent} from '../../../common/models/watchTimeEvent';
import WatchTime from '../../models/watchTime';
import {validateNew} from '../../../common/util';

export const createStoreWatchTime = ({dataSource, log}: {
	dataSource: DataSource;
	log: LogFunction;
}) => async (event: WatchTimeEvent) => {
	const eventRepo = dataSource.getRepository(WatchTime);
	const watchTime = new WatchTime();
	watchTime.eventId = event.id;
	watchTime.secondsWatched = event.secondsWatched;
	try {
		await validateNew(watchTime);
		await eventRepo.save(watchTime);
	} catch (err) {
		log('Error storing watch time event meta-data', err);
	}
};

export default createStoreWatchTime;

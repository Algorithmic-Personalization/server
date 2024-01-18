import {Like, type DataSource} from 'typeorm';

import Video from '../models/video';
import {type LogFunction} from './logger';

export const cleanId = (id: string): string => {
	const [res] = id.split('&');
	return res;
};

export const cleanVideoIds = async (dataSource: DataSource, log: LogFunction): Promise<number> => {
	const repo = dataSource.getRepository(Video);

	const initialYouTubeIds: string[] = [];

	const problematicVideos = await repo
		.find({
			where: {
				youtubeId: Like('%&%'),
			},
		});

	problematicVideos.forEach(video => {
		initialYouTubeIds.push(video.youtubeId);
		video.youtubeId = cleanId(video.youtubeId);
	});

	log('info', 'cleaning up', problematicVideos.length, 'video ids');

	const promises = problematicVideos.map(async video => repo.save(video));

	const res = await Promise.allSettled(promises);

	const count = res.filter(({status}, i) => {
		const ok = status === 'fulfilled';

		if (!ok) {
			log('warning', 'failed to clean video id', problematicVideos[i].id);
		}

		return ok;
	}).length;

	log('info', 'cleaned', count, 'video ids');
	log('info', 'failed to clean', res.length - count, 'video ids');

	return count;
};

export default cleanVideoIds;

import {type DataSource} from 'typeorm';

import Video from '../models/video';

import {type LogFunction} from './logger';
import {type YtApi} from './youTubeApi';
import {
	pct,
	formatPct,
	formatSize,
	showSql,
	sleep,
} from '../../util';

const retryDelay25Hours = 25 * 60 * 60 * 1000;

export const scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi): Promise<void> => {
	const show = showSql(log);

	const videoCount = await dataSource.getRepository(Video).count();

	log('info', 'there are currently', videoCount, 'videos in the database');

	const {heapUsed} = process.memoryUsage();

	const videos: string[] = (await show(
		dataSource.createQueryBuilder()
			.select('distinct(v.youtube_id)', 'youtube_id')
			.from(Video, 'v')
			.where(qb => {
				const subQuery = qb.subQuery()
					.select('1')
					.from('video_metadata', 'vmd')
					.where('vmd.youtube_id = v.youtube_id');

				return `NOT EXISTS ${subQuery.getQuery()}`;
			}),
	).getRawMany<{youtube_id: string}>()).map(
		({youtube_id}) => youtube_id,
	);

	const {heapUsed: heapUsedAfter} = process.memoryUsage();

	log('info', 'among which', videos.length, 'are without metadata');
	log('info', 'that is,', formatPct(pct(videos.length, videoCount)), 'of all videos');
	log('info', 'memory used to get the list:', formatSize(heapUsedAfter - heapUsed));

	const batchSize = 50;

	while (videos.length) {
		const batch = videos.splice(0, batchSize);

		// eslint-disable-next-line no-await-in-loop
		const {data, ...stats} = await api.getMetaFromVideoIds(batch);
		log('info', 'yt batch scrape result:', stats);

		if (data.size === 0) {
			log(
				'error',
				'yt batch scrape returned no data, API quota probably exceeded, stopping scrape and starting again in 25h',
			);

			setTimeout(async () => {
				try {
					await scrape(dataSource, log, api);
				} catch (error) {
					log('error', 'error while restarting scrape:', error);
				}
			}, retryDelay25Hours);
		}

		// eslint-disable-next-line no-await-in-loop
		await sleep(500);
	}
};

export default scrape;

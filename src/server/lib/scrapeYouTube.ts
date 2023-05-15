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

const oneDayRetryDelay = 1000 * 60 * 60 * 24;

class Limiter {
	#waitDelays = [500, 500, 500, 1000, 1000, 2000, 5000, 10000, 10000];
	#waitIndex = 0;

	constructor(private readonly log: LogFunction) {}

	shouldGiveUp(callWasSuccessful: boolean): boolean {
		if (callWasSuccessful) {
			if (this.#waitIndex > 0) {
				--this.#waitIndex;
				this.log('info', 'querying a bit faster because latest call was successful, now waiting', this.getDelay(), 'ms');
			}

			return false;
		}

		++this.#waitIndex;
		this.log('warning', 'latest call was not successful, waiting for', this.getDelay(), 'ms for a bit');

		const giveUp = this.#waitIndex === this.#waitDelays.length;

		if (giveUp) {
			this.log('error', 'giving scraping, too many consecutive failures');
		}

		return giveUp;
	}

	getDelay(): number {
		return this.#waitDelays[Math.min(this.#waitDelays.length - 1, this.#waitIndex)];
	}
}

const _scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi): Promise<number> => {
	const show = showSql(log);

	const videoCount = await dataSource.getRepository(Video).count();

	log('info', 'there are currently', videoCount, 'videos in the database');

	const {heapUsed} = process.memoryUsage();

	const videos: string[] = (await show(
		dataSource.createQueryBuilder()
			.select('distinct(v.youtube_id)', 'youtube_id')
			.from(Video, 'v')
			.leftJoin('video_metadata', 'vm', 'v.youtube_id = vm.youtube_id')
			.where('vm.youtube_id is null')
			.andWhere('v.metadata_available is null'),
	).getRawMany<{youtube_id: string}>()).map(
		({youtube_id}) => youtube_id,
	);

	const {heapUsed: heapUsedAfter} = process.memoryUsage();

	log('info', 'among which', videos.length, 'are without metadata');
	log('info', 'that is,', formatPct(pct(videos.length, videoCount)), 'of all videos');
	log('info', 'memory used to get the list:', formatSize(heapUsedAfter - heapUsed));

	const batchSize = 50;
	const limiter = new Limiter(log);
	let scrapeCount = 0;

	while (videos.length) {
		const batch = videos.splice(0, batchSize);

		// eslint-disable-next-line no-await-in-loop
		const {data, ...stats} = await api.getMetaFromVideoIds(batch);
		log('info', 'yt batch scrape result:', stats);

		scrapeCount += data.size;
		const callWasSuccessful = data.size > 0;

		if (!callWasSuccessful) {
			log('warning', 'yt batch scrape result was not entirely successful, only got', data.size, 'videos out of', batch.length);
		}

		if (limiter.shouldGiveUp(callWasSuccessful)) {
			log('error', 'giving up scraping YT API for now, too many consecutive failures');
			break;
		}

		// eslint-disable-next-line no-await-in-loop
		await sleep(limiter.getDelay());
	}

	log('successfully', 'scraped', scrapeCount, 'videos from yt API');

	return scrapeCount;
};

export const scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi): Promise<void> => {
	if (!api.hasDataSource()) {
		log('error', 'no data source provided to YT API, skipping scrape');
		return;
	}

	for (;;) {
		log('info', 'starting yt API scrape');
		// eslint-disable-next-line no-await-in-loop
		await _scrape(dataSource, log, api);
		log('info', 'yt API scrape finished, waiting', oneDayRetryDelay, 'ms before next scrape');
		// eslint-disable-next-line no-await-in-loop
		await sleep(oneDayRetryDelay);
	}
};

export default scrape;

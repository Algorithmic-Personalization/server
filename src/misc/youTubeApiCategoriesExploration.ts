import {basename, join} from 'path';
import {readFile} from 'fs/promises';
import {createWriteStream} from 'fs';

import {parse} from 'yaml';
import {DataSource} from 'typeorm';

import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import {findPackageJsonDir, getString} from '../common/util';
import getYouTubeConfig from '../server/lib/config-loader/getYouTubeConfig';
import makeCreateYouTubeApi, {type CategoryListItem, type YtApi} from '../server/lib/youTubeApi';

import entities from '../server/entities';
import DatabaseLogger from '../server/lib/databaseLogger';
import {type LogFunction, makeCreateDefaultLogger} from '../server/lib/logger';

import Video from '../server/models/video';

import {asyncPerf, formatPct, pct, formatSize} from '../util';

const commands = new Map([
	['compare', 'will compare the categories set of different regions'],
	['scrape', 'will scrape meta-data for all the videos we don\'t have yet'],
]);

const commandsNeedingDataSource = new Set(['scrape']);

const sleep = async (ms: number): Promise<void> => new Promise(resolve => {
	setTimeout(resolve, ms);
});

const env = (): 'production' | 'development' => {
	const env = process.env.NODE_ENV;

	if (env === 'production') {
		return 'production';
	}

	process.env.node_env = 'development';

	return 'development';
};

const keypress = async (): Promise<string> => {
	process.stdin.setRawMode(true);

	return new Promise(resolve => {
		process.stdin.once('data', d => {
			process.stdin.setRawMode(false);
			resolve(d.toString('utf-8'));
		});
	});
};

class RateLimiter {
	#sleepTimes = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800];
	#sleepIndex = 0;
	#maxAttemptsAtMaxSleep = 5;
	#attemptsAtMaxSleepLeft: number;

	constructor(public readonly log: LogFunction) {
		this.#attemptsAtMaxSleepLeft = this.#maxAttemptsAtMaxSleep;
	}

	async sleep(latestCallWasSuccessful: boolean): Promise<number> {
		if (latestCallWasSuccessful) {
			this.#attemptsAtMaxSleepLeft = this.#maxAttemptsAtMaxSleep;

			if (this.#sleepIndex > 0) {
				--this.#sleepIndex;
			}
		} else if (this.#sleepIndex < this.#sleepTimes.length - 1) {
			++this.#sleepIndex;
		} else if (this.#attemptsAtMaxSleepLeft > 0) {
			--this.#attemptsAtMaxSleepLeft;
		}

		const t = this.getSleepTime();

		if (t > 0) {
			this.log('warning', `we're probably being rate-limited, sleeping for ${t} ms`);
			await sleep(t);
			return t;
		}

		return 0;
	}

	getSleepTime(): number {
		return this.#sleepTimes[this.#sleepIndex];
	}

	isStuck(): boolean {
		return this.#attemptsAtMaxSleepLeft === 0;
	}
}

type MemReport = {
	tStart: Date;
	maxHeapUsed: string;
	maxHeapTime: Date;
	minHeapUsed: string;
	minHeapTime: Date;
	deltaHeapUsed: string;
};

class MemWatcher {
	#tStart = Date.now();
	#minHeapUsed = Infinity;
	#minHeapTime = 0;
	#maxHeapUsed = 0;
	#maxHeapTime = 0;

	#interval: NodeJS.Timer;

	constructor(public readonly intervalMs = 100) {
		this.#interval = setInterval(() => {
			const {heapUsed} = process.memoryUsage();

			if (heapUsed < this.#minHeapUsed) {
				this.#minHeapUsed = heapUsed;
				this.#minHeapTime = Date.now();
			} else if (heapUsed > this.#maxHeapUsed) {
				this.#maxHeapUsed = heapUsed;
				this.#maxHeapTime = Date.now();
			}
		}, intervalMs);
	}

	stop(): MemReport {
		clearInterval(this.#interval);

		return {
			tStart: new Date(this.#tStart),
			maxHeapUsed: formatSize(this.#maxHeapUsed),
			maxHeapTime: new Date(this.#maxHeapTime),
			minHeapUsed: formatSize(this.#minHeapUsed),
			minHeapTime: new Date(this.#minHeapTime),
			deltaHeapUsed: formatSize(this.#maxHeapUsed - this.#minHeapUsed),
		};
	}
}

const _scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi, batchId: number): Promise<[number, number]> => {
	log('gonna scrape!');

	const query = dataSource
		.getRepository(Video)
		.createQueryBuilder('v')
		.select('distinct v.youtube_id')
		.where('not exists (select 1 from video_metadata m where m.youtube_Id = v.youtube_Id)')
		.orderBy('v.youtube_id', 'ASC');

	log('running query: ', query.getSql());
	const youtubeIdsWithoutMetadataCount: number = await asyncPerf(
		async () => query.getCount(),
		'select youtube_id\'s without metadata',
		log,
	);

	const videoCount = await dataSource.getRepository(Video).count();
	log('youtube_id\'s needing fetching the meta-data of:', youtubeIdsWithoutMetadataCount);
	log('total video count:', videoCount);
	log(`percentage of videos lacking meta-data: ${formatPct(pct(youtubeIdsWithoutMetadataCount, videoCount))}`);

	if (batchId === 0) {
		log('press y to continue, anything else to abort');
		const input = await keypress();

		if (input !== 'y') {
			log('aborting as requested by user');
			return [0, 0];
		}
	}

	const pageSize = 50;
	let nVideosQueried = 0;
	let nMetaObtained = 0;
	let refetched = 0;
	let timeSlept = 0;

	const rateLimiter = new RateLimiter(log);

	for (let offset = 0; ; ++offset) {
		try {
			// eslint-disable-next-line no-await-in-loop
			const videos: Array<{youtube_id: string}> = await asyncPerf(
				async () => query.take(pageSize).limit(pageSize).offset(offset * pageSize).getRawMany(),
				`attempting to fetch ${pageSize} videos at offset ${offset * pageSize} from the db`,
				log,
			);

			const pageIds = videos.map(v => v.youtube_id);

			nVideosQueried += pageIds.length;

			log('fetched', videos.length, 'videos from the db:', pageIds);

			if (videos.length === 0) {
				log('no more videos to fetch from db');
				break;
			}

			// eslint-disable-next-line no-await-in-loop
			const meta = await asyncPerf(
				async () => api.getMetaFromVideoIds(pageIds),
				`attempting to fetch meta-data for ${videos.length} videos using the YouTube API`,
				log,
			);
			const {data, ...stats} = meta;

			const latestCallWasSuccessful = data.size > 0;

			// eslint-disable-next-line no-await-in-loop
			timeSlept += await rateLimiter.sleep(latestCallWasSuccessful);
			if (!latestCallWasSuccessful) {
				if (rateLimiter.isStuck()) {
					log('looks like we\'re stuck, aborting');
					break;
				}

				--offset;
				continue;
			}

			nMetaObtained += data.size;
			refetched += stats.refetched;

			log('got meta-data for', data.size, 'videos with stats:', stats);
			log('info', `${formatPct(pct(nMetaObtained, videoCount))} youtubeIdsWithoutMetadataCount`);

			// We don't need to persist the meta-data here because the
			// `getMetaFromVideoIds` method already does that for us.

			++offset;
		} catch (e) {
			log('error while fetching videos from the db', e);
			return [0, nMetaObtained];
		}
	}

	const nowMissing = await query.getCount();
	const finalPct = formatPct(pct(nowMissing, videoCount));
	if (nowMissing !== 0) {
		log('warning', `now still missing ${finalPct} of the videos...`);
		log(
			'warning',
			'obtained only',
			formatPct(pct(nMetaObtained, nVideosQueried)),
			'of the meta-data we asked for',
		);
	}

	log('counted', youtubeIdsWithoutMetadataCount, 'videos without meta-data and queried', nVideosQueried);
	if (youtubeIdsWithoutMetadataCount !== nVideosQueried) {
		log(
			'warning',
			'youtubeIdsWithoutMetadataCount !== nVideosQueried:',
			'did not query the API for all the videos we thought we needed to.',
			`only ${formatPct(pct(nVideosQueried, youtubeIdsWithoutMetadataCount))} of the videos were queried`,
		);
	}

	if (refetched !== 0) {
		log('warning', 'refetched', refetched, 'videos');
	}

	log('info', 'time slept for rate-limiting:', timeSlept, 'ms');

	log('debug', 'batch', batchId, 'done');

	return [nowMissing, nMetaObtained];
};

const scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi) => {
	let i = 0;
	let missing: number;
	let obtained: number;

	const memWatcher = new MemWatcher();

	do {
		// eslint-disable-next-line no-await-in-loop
		[missing, obtained] = await _scrape(dataSource, log, api, i);
		++i;
		if (missing !== 0) {
			if (obtained > 0) {
				log('warning', 'could not get all the meta-data in one go, trying again...');
			} else {
				log('error', 'no meta-data obtained, giving up');
				break;
			}
		}
	} while (missing !== 0);

	log('info', 'done scraping meta-data in', i, 'passes');

	if (missing > 0) {
		log('warning', 'still missing', missing, 'video meta-data');
	}

	const mem = memWatcher.stop();
	log('info', 'memory usage stats:', mem);
};

// TODO: move this to a separate file, use in in server.ts because it
// is duplicated there and it is ugly in server.ts
const createDataSource = async (projectRootDir: string, log: LogFunction): Promise<DataSource> => {
	const dockerComposeJson = await readFile(join(projectRootDir, 'docker-compose.yaml'), 'utf-8');
	const dockerComposeConfig = parse(dockerComposeJson) as unknown;
	if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
		throw new Error('Invalid docker-compose.yaml');
	}

	const outsideDocker = process.env.OUTSIDE_DOCKER !== 'false';
	log(`we are running ${outsideDocker ? 'outside' : 'inside'} docker in ${env()} mode`);

	const dbPortString = getString(['services', `${env()}-db`, 'ports', '0'])(dockerComposeConfig);
	const [dbHostPort, dbDockerPort] = dbPortString.split(':');

	const dbPort = outsideDocker ? Number(dbHostPort) : Number(dbDockerPort);

	if (!dbPort || !Number.isInteger(dbPort)) {
		throw new Error(`Invalid db port: ${dbPort}`);
	}

	const dbConfigPath = ['services', `${env()}-db`, 'environment'];
	const dbHost = outsideDocker ? 'localhost' : `${env()}-db`;
	const dbUser = getString([...dbConfigPath, 'POSTGRES_USER'])(dockerComposeConfig);
	const dbPassword = getString([...dbConfigPath, 'POSTGRES_PASSWORD'])(dockerComposeConfig);
	const dbDatabase = getString([...dbConfigPath, 'POSTGRES_DB'])(dockerComposeConfig);

	const dbConfig = {
		host: dbHost,
		port: dbPort,
		user: dbUser,
		password: dbPassword,
		database: dbDatabase,
	};

	const ds = new DataSource({
		type: 'postgres',
		...dbConfig,
		username: dbUser,
		synchronize: false,
		entities,
		namingStrategy: new SnakeNamingStrategy(),
		// D logging: true,
		logger: new DatabaseLogger(log),
	});

	await ds.initialize();

	return ds;
};

const compareCategoriesOfTwoRegions = async (regionA: string, regionB: string, log: LogFunction, api: YtApi) => {
	type CategoriesMap = Map<string, CategoryListItem>;

	const [categoriesA, categoriesB] = await Promise.all([
		api.getCategoriesFromRegionCode(regionA),
		api.getCategoriesFromRegionCode(regionB),
	]);

	const toMap = (categories: CategoryListItem[]): CategoriesMap => {
		const map: CategoriesMap = new Map();

		for (const category of categories) {
			map.set(category.id, category);
		}

		return map;
	};

	const mapA = toMap(categoriesA);
	const mapB = toMap(categoriesB);

	if (mapA.size !== mapB.size) {
		log(
			`Categories of ${regionA} and ${regionB} differ in size,`,
			`region ${regionA} has ${mapA.size} categories,`,
			`while region ${regionB} has ${mapB.size} categories.`,
		);
	}

	for (const [id, categoryA] of mapA) {
		const categoryB = mapB.get(id);

		if (!categoryB) {
			log(
				`Category ${categoryA.snippet.title} (${id})`,
				`is only available in region ${regionA},`,
				`but not in region ${regionB}.`,
			);
		}
	}

	for (const [id, categoryB] of mapB) {
		const categoryA = mapA.get(id);

		if (!categoryA) {
			log(
				`Category ${categoryB.snippet.title} (${id})`,
				`is only available in region ${regionB},`,
				`but not in region ${regionA}.`,
			);
		}
	}

	for (const [id, categoryA] of mapA) {
		const categoryB = mapB.get(id);

		if (!categoryB) {
			continue;
		}

		if (categoryA.snippet.title !== categoryB.snippet.title) {
			log(
				`Category ${categoryA.snippet.title} (${id})`,
				`is called ${categoryB.snippet.title} in region ${regionB}.`,
			);
		}
	}
};

const compareSomeCategoriesWithUs = async (log: LogFunction, api: YtApi) => {
	const regionA = 'US';
	const regionBs = ['FR', 'DE', 'GB', 'CA', 'AU', 'IT', 'JP', 'GR'];

	for (const regionB of regionBs) {
		// eslint-disable-next-line no-await-in-loop
		await compareCategoriesOfTwoRegions(regionA, regionB, log, api);
	}
};

const main = async () => {
	const cmd = process.argv[2];

	const root = await findPackageJsonDir(__dirname);

	const createLog = makeCreateDefaultLogger(
		createWriteStream(
			join(root, `${basename(__filename)}.log`), {
				flags: 'a',
			}));

	const log = createLog('<main>');

	if (!commands.has(cmd)) {
		log('Please provide a command, one of:');
		for (const [cmd, desc] of commands) {
			log(`  ${cmd}: ${desc}`);
		}

		process.exit(1);
	}

	const configJson = await readFile(join(root, 'config.yaml'), 'utf-8');
	const config = parse(configJson) as unknown;
	const youTubeConfig = getYouTubeConfig(config);

	const createApiWithCache = makeCreateYouTubeApi('with-cache');
	const createApiWithoutCache = makeCreateYouTubeApi('without-cache');

	const dataSourceNeeded = commandsNeedingDataSource.has(cmd);

	const dataSource = dataSourceNeeded
		? await createDataSource(root, log)
		: undefined;

	if (dataSourceNeeded && !dataSource) {
		console.error(
			'The command"',
			cmd,
			'" needs a dataSource,',
			'so you will need to customize docker-compose.yaml',
			'to your needs',
		);
		process.exit(1);
	}

	const apiWithCache = createApiWithCache(youTubeConfig, createLog('<yt-cached-api>'), dataSource);
	const apiWithoutCache = createApiWithoutCache(youTubeConfig, createLog('<yt-uncached-api>'), dataSource);

	if (cmd === 'compare') {
		log('Running compare...');
		await compareSomeCategoriesWithUs(
			createLog('<compare>'),
			apiWithCache,
		);
	} else if (cmd === 'scrape') {
		console.log('Running scrape...');
		if (!dataSource) {
			throw new Error('dataSource is undefined');
		}

		try {
			const scrapeLog = createLog('<scrape>');
			// Use API without memory cache to minimize RAM usage on low-perf server
			await scrape(dataSource, scrapeLog, apiWithoutCache);
		} catch (err) {
			console.error('Error while scraping:', err);
		}
	} else {
		log('Unknown command', cmd);
		log('Try one of:');
		for (const [cmd, desc] of commands) {
			log(`  ${cmd}: ${desc}`);
		}

		process.exit(1);
	}

	process.exit(0);
};

main().catch(console.error);


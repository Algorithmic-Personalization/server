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

import {asyncPerf, formatPct, pct} from '../util';

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

const scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi, pauseBetweenBatches = 200): Promise<void> => {
	log('gonna scrape!');

	const query = dataSource
		.getRepository(Video)
		.createQueryBuilder('v')
		.select('distinct v.youtube_id')
		.where('not exists (select 1 from video_metadata m where m.youtube_Id = v.youtube_Id)');

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

	log('press y to continue, anything else to abort');

	const input = await keypress();

	if (input !== 'y') {
		log('aborting as requested by user');
		process.exit(0);
		return;
	}

	const pageSize = 25;
	let nMetaAskedFor = 0;
	let nMetaObtained = 0;
	let refetched = 0;

	let retrying = false;

	for (let offset = 0; ; ++offset) {
		try {
			// eslint-disable-next-line no-await-in-loop
			const videos: Array<{youtube_id: string}> = await asyncPerf(
				async () => query.limit(pageSize).offset(offset * pageSize).getRawMany(),
				`attempting to fetch ${pageSize} videos at offset ${offset * pageSize} from the db`,
				log,
			);

			const pageIds = videos.map(v => v.youtube_id);

			nMetaAskedFor += pageIds.length;

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

			if (data.size > 0 && retrying) {
				retrying = false;
			}

			if (data.size === 0) {
				log('no meta-data obtained from the YouTube API, we\'re probably being rate-limited');
				const extraPause = pauseBetweenBatches * 5;
				// eslint-disable-next-line no-await-in-loop
				await sleep(extraPause);
				if (!retrying) {
					retrying = true;
					--offset;
				}

				continue;
			}

			nMetaObtained += data.size;
			refetched += stats.refetched;

			log('got meta-data for', data.size, 'videos with stats:', stats);

			// We don't need to persist the meta-data here because the
			// `getMetaFromVideoIds` method already does that for us.

			++offset;
		} catch (e) {
			log('error while fetching videos from the db', e);
			process.exit(1);
		}

		// eslint-disable-next-line no-await-in-loop
		await sleep(pauseBetweenBatches);
	}

	const nowMissing = await query.getCount();
	const finalPct = formatPct(pct(nowMissing, videoCount));
	if (nowMissing !== 0) {
		log('warning', `now still missing ${finalPct} of the videos...`);
		log(
			'warning',
			'obtained only',
			formatPct(pct(nMetaObtained, nMetaAskedFor)),
			'of the meta-data we asked for',
		);
	}

	if (refetched !== 0) {
		log('warning', 'refetched', refetched, 'videos');
	}

	log('success', 'done!');
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


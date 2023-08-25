import {basename, join} from 'path';
import {readFile} from 'fs/promises';

import {parse} from 'yaml';
import {DataSource} from 'typeorm';

import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import {findPackageJsonDir, getString} from '../common/util';
import {sleep} from '../util';
import getYouTubeConfig from '../server/lib/config-loader/getYouTubeConfig';
import makeCreateYouTubeApi, {type CategoryListItem, type YtApi} from '../server/lib/youTubeApi';

import entities from '../server/entities';
import DatabaseLogger from '../server/lib/databaseLogger';
import {type LogFunction, makeCreateDefaultLogger} from '../server/lib/logger';
import scrape from '../server/lib/scrapeYouTube';

const commands = new Map([
	['compare', 'will compare the categories set of different regions'],
	['scrape', 'will scrape meta-data for all the videos we don\'t have yet'],
]);

const commandsNeedingDataSource = new Set(['scrape']);

const env = (): 'production' | 'development' => {
	const env = process.env.NODE_ENV;

	if (env === 'production') {
		return 'production';
	}

	process.env.node_env = 'development';

	return 'development';
};

export const keypress = async (): Promise<string> => {
	process.stdin.setRawMode(true);

	return new Promise(resolve => {
		process.stdin.once('data', d => {
			process.stdin.setRawMode(false);
			resolve(d.toString('utf-8'));
		});
	});
};

export class RateLimiter {
	#sleepTimes = [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800];
	#sleepIndex = 0;
	#maxAttemptsAtMaxSleep = 5;
	#attemptsAtMaxSleepLeft: number;
	#baseDelay = 100;

	constructor(public readonly log: LogFunction) {
		this.#attemptsAtMaxSleepLeft = this.#maxAttemptsAtMaxSleep;
	}

	async sleep(latestCallWasSuccessful: boolean): Promise<number> {
		await sleep(this.#baseDelay);

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

// TODO: move this to a separate file, use in in server.ts because it
// is duplicated there and it is ugly in server.ts
const createDataSource = async (projectRootDir: string, log: LogFunction): Promise<DataSource> => {
	const dockerComposeJson = await readFile(join(projectRootDir, 'docker-compose.yaml'), 'utf-8');
	const dockerComposeConfig = parse(dockerComposeJson) as unknown;
	if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
		throw new Error('Invalid docker-compose.yaml');
	}

	const insideDocker = process.env.INSIDE_DOCKER === 'true';
	const outsideDocker = !insideDocker;
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

	const dbConfigForLog = {...dbConfig, password: '<masked>'};

	log('info', 'dbConfig:', dbConfigForLog);

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
		join(root, `${basename(__filename)}.log`),
	);

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


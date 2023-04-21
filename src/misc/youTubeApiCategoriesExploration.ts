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
// D import DatabaseLogger from '../server/lib/databaseLogger';
import {type LogFunction, makeCreateDefaultLogger} from '../server/lib/logger';

import Video from '../server/models/video';

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

const keypress = async (): Promise<string> => {
	process.stdin.setRawMode(true);

	return new Promise(resolve => {
		process.stdin.once('data', d => {
			process.stdin.setRawMode(false);
			resolve(d.toString('utf-8'));
		});
	});
};

const scrape = async (dataSource: DataSource, log: LogFunction, api: YtApi): Promise<void> => {
	log('gonna scrape!');

	const query = dataSource
		.getRepository(Video)
		.createQueryBuilder('v')
		.select('distinct v.youtube_id')
		.where('not exists (select 1 from video_metadata m where m.youtube_Id = v.youtube_Id)');

	log('running query: ', query.getSql());
	const youtubeIdsWithoutMetadata: Array<{youtube_id: string}> = await query.getRawMany();
	const videoCount = await dataSource.getRepository(Video).count();
	log('youtubeIds needing fetching the meta-data for:', youtubeIdsWithoutMetadata.length);
	log('total video count:', videoCount);
	log(`percentage of videos lacking meta-data: ${(youtubeIdsWithoutMetadata.length * 100 / videoCount).toFixed(2)}%`);

	log('press y to continue, anything else to abort');

	const input = await keypress();

	if (input !== 'y') {
		log('aborting');
		process.exit(0);
		return;
	}

	const pagesToFetch: string[][] = [];

	const idsPerRequest = 50;

	let pos = 0;
	let persisted = 0;
	for (; pos + idsPerRequest < youtubeIdsWithoutMetadata.length; pos += idsPerRequest) {
		pagesToFetch.push(youtubeIdsWithoutMetadata.slice(pos, pos + 50).map(x => x.youtube_id));
	}

	if (pos < youtubeIdsWithoutMetadata.length) {
		pagesToFetch.push(youtubeIdsWithoutMetadata.slice(pos).map(x => x.youtube_id));
	}

	for (const page of pagesToFetch) {
		// eslint-disable-next-line no-await-in-loop
		const meta = await api.getMetaFromVideoIds(page);
		const {data, ...stats} = meta;
		persisted += data.size;
		const progress = (persisted * 100 / youtubeIdsWithoutMetadata.length).toFixed(2);
		log('got meta-data for', data.size, `videos (\x1b[34m${progress}\x1b[0m%) with stats:`, stats);
	}

	log('done!');
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
		// D logger: new DatabaseLogger(console.log),
	});

	await ds.initialize();

	return ds;
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

	const createApi = makeCreateYouTubeApi();

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

	const api = createApi(youTubeConfig, createLog('<yt-api>'), dataSource);

	const compareCategoriesOfTwoRegions = async (regionA: string, regionB: string) => {
		const log = createLog('<compare-categories>');
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

	const compareSomeCategoriesWithUs = async () => {
		const regionA = 'US';
		const regionBs = ['FR', 'DE', 'GB', 'CA', 'AU', 'IT', 'JP', 'GR'];

		for (const regionB of regionBs) {
			// eslint-disable-next-line no-await-in-loop
			await compareCategoriesOfTwoRegions(regionA, regionB);
		}
	};

	if (cmd === 'compare') {
		console.log('Running compare...');
		await compareSomeCategoriesWithUs();
	} else if (cmd === 'scrape') {
		console.log('Running scrape...');
		if (!dataSource) {
			throw new Error('dataSource is undefined');
		}

		try {
			const scrapeLog = createLog('<scrape>');
			await scrape(dataSource, scrapeLog, api);
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


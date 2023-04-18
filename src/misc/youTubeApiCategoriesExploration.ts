import {join} from 'path';
import {readFile} from 'fs/promises';

import {parse} from 'yaml';
import {DataSource} from 'typeorm';

import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import {findPackageJsonDir, getString} from '../common/util';
import getYouTubeConfig from '../server/lib/config-loader/getYouTubeConfig';
import makeCreateYouTubeApi, {type CategoryListItem, type YtApi} from '../server/lib/youTubeApi';

import entities from '../server/entities';
import DatabaseLogger from '../server/lib/databaseLogger';
import {type LogFunction, createDefaultLogger} from '../server/lib/logger';
import {createWriteStream} from 'fs';

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

const scrape = async (dataSource: DataSource, log: LogFunction, _api: YtApi): Promise<void> => {
	const youtubeIdsWithoutMetadata = await dataSource
		.createQueryBuilder()
		.select('video.youtube_id', 'youtube_id')
		.from('Video', 'video')
		.where('video.youtube_id NOT IN (SELECT youtube_id FROM video_metadata)')
		.limit(10)
		.getMany();

	log('youtubeIds needing fetching the meta-data for:', youtubeIdsWithoutMetadata);
};

// TODO: move this to a separate file, use in in server.ts because it
// is duplicated there and it is ugly in server.ts
//
// TODO: dissociate the fact that we're in development from the fact that
// we're using docker-compose
const createDataSource = async (projectRootDir: string): Promise<DataSource> => {
	const dockerComposeJson = await readFile(join(projectRootDir, 'docker-compose.yaml'), 'utf-8');
	const dockerComposeConfig = parse(dockerComposeJson) as unknown;
	if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
		throw new Error('Invalid docker-compose.yaml');
	}

	const dbPortString = getString(['services', `${env()}-db`, 'ports', '0'])(dockerComposeConfig);
	const [dbHostPort, dbDockerPort] = dbPortString.split(':');

	const dbPort = env() === 'development' ? Number(dbHostPort) : Number(dbDockerPort);

	if (!dbPort || !Number.isInteger(dbPort)) {
		throw new Error(`Invalid db port: ${dbPort}`);
	}

	const dbConfigPath = ['services', `${env()}-db`, 'environment'];
	const dbHost = env() === 'development' ? 'localhost' : `${env()}-db`;
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
		logging: true,
		maxQueryExecutionTime: 200,
		logger: new DatabaseLogger(console.log),
	});

	await ds.initialize();

	return ds;
};

const main = async () => {
	const cmd = process.argv[2];
	console.log(process.argv);

	if (!commands.has(cmd)) {
		console.log('Please provide a command, one of:');
		for (const [cmd, desc] of commands) {
			console.log(`  ${cmd}: ${desc}`);
		}

		process.exit(1);
	}

	const root = await findPackageJsonDir(__dirname);
	const configJson = await readFile(join(root, 'config.yaml'), 'utf-8');
	const config = parse(configJson) as unknown;
	const youTubeConfig = getYouTubeConfig(config);

	const createApi = makeCreateYouTubeApi();

	const dataSourceNeeded = commandsNeedingDataSource.has(cmd);

	const dataSource = dataSourceNeeded
		? await createDataSource(root)
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

	const api = createApi(youTubeConfig, console.log);

	const compareCategoriesOfTwoRegions = async (regionA: string, regionB: string) => {
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
			console.log(
				`Categories of ${regionA} and ${regionB} differ in size,`,
				`region ${regionA} has ${mapA.size} categories,`,
				`while region ${regionB} has ${mapB.size} categories.`,
			);
		}

		for (const [id, categoryA] of mapA) {
			const categoryB = mapB.get(id);

			if (!categoryB) {
				console.log(
					`Category ${categoryA.snippet.title} (${id})`,
					`is only available in region ${regionA},`,
					`but not in region ${regionB}.`,
				);
			}
		}

		for (const [id, categoryB] of mapB) {
			const categoryA = mapA.get(id);

			if (!categoryA) {
				console.log(
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
				console.log(
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

		const log = createDefaultLogger(createWriteStream('scrape.log'));

		await scrape(dataSource, log, api);
	} else {
		console.log('Unknown command', cmd);
		console.log('Try one of:');
		for (const [cmd, desc] of commands) {
			console.log(`  ${cmd}: ${desc}`);
		}

		process.exit(1);
	}
};

main().catch(console.error);


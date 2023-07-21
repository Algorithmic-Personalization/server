import {migrate} from 'postgres-migrations';
import {DataSource} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {Client} from 'pg';
import pgTools from 'pgtools';

import loadDatabaseConfig from '../lib/config-loader/loadDbConfig';
import entities from '../entities';

export type TestDb = {
	dataSource: DataSource;
	client: Client;
};

const resetDb = async (): Promise<TestDb> => {
	const dbConfig = await loadDatabaseConfig({
		environnement: 'test',
		useDockerAddress: false,
	});

	const {database: _ignored, ...dbConfigWithoutDatabase} = dbConfig;

	await pgTools.dropdb(dbConfigWithoutDatabase, 'ytdpnl');
	await pgTools.createdb(dbConfigWithoutDatabase, 'ytdpnl');

	const client = new Client(dbConfig);
	await client.connect();

	await migrate(dbConfig, dbConfig.migrationsDir);

	const ds = new DataSource({
		type: 'postgres',
		...dbConfig,
		username: dbConfig.user,
		synchronize: false,
		entities,
		namingStrategy: new SnakeNamingStrategy(),
		logging: true,
		maxQueryExecutionTime: 200,
	});

	const dataSource = await ds.initialize();
	console.log('dataSource initialized', dataSource);

	return {dataSource, client};
};

export default resetDb;

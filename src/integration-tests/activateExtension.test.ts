import {migrate} from 'postgres-migrations';
import {DataSource} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {Client} from 'pg';
import pgTools from 'pgtools';

import loadDatabaseConfig from '../server/lib/config-loader/loadDbConfig';
import entities from '../server/entities';

describe('activateExtension', () => {
	let dataSource: DataSource;
	let client: Client;

	beforeAll(async () => {
		const dbConfig = await loadDatabaseConfig({
			environnement: 'test',
			useDockerAddress: false,
		});

		const {database: _ignored, ...dbConfigWithoutDatabase} = dbConfig;

		await pgTools.dropdb(dbConfigWithoutDatabase, 'ytdpnl');
		await pgTools.createdb(dbConfigWithoutDatabase, 'ytdpnl');

		client = new Client(dbConfig);
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

		dataSource = await ds.initialize();
		console.log('dataSource initialized', dataSource);
	});

	it('is a dummy test', () => {
		expect(1 + 1).toBe(2);
	});
});

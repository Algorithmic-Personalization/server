import {join} from 'path';
import {findPackageJsonDir, getString} from '../../../common/util';
import {readFile} from 'fs/promises';
import {parse} from 'yaml';

export type DbConfig = {
	host: string;
	port: number;
	user: string;
	password: string;
	database: string;
	migrationsDir: string;
};

export type ConfigType = {
	environnement: 'production' | 'development' | 'test';
	useDockerAddress: boolean;
};

export const loadDatabaseConfig = async (
	configType: ConfigType,
	projectRoot?: string,
): Promise<DbConfig> => {
	const root = projectRoot ?? await findPackageJsonDir(__dirname);
	const dockerComposePath = join(root, 'docker-compose.yaml');
	const dockerComposeYaml = await readFile(dockerComposePath, 'utf-8');
	const dockerComposeConfig = parse(dockerComposeYaml) as unknown;

	const env = configType.environnement;

	const dbConfigPath = ['services', `${env}-db`, 'environment'];

	const host = configType.useDockerAddress ? `${env}-db` : 'localhost';
	const user = getString([...dbConfigPath, 'POSTGRES_USER'])(dockerComposeConfig);
	const password = getString([...dbConfigPath, 'POSTGRES_PASSWORD'])(dockerComposeConfig);
	const database = getString([...dbConfigPath, 'POSTGRES_DB'])(dockerComposeConfig);

	const dbPortString = getString(['services', `${env}-db`, 'ports', '0'])(dockerComposeConfig);
	const [dbHostPort, dbDockerPort] = dbPortString.split(':');

	const port = configType.useDockerAddress ? Number(dbDockerPort) : Number(dbHostPort);

	if (!port || !Number.isInteger(port)) {
		throw new Error(`Invalid db port: ${port}`);
	}

	return {
		host,
		port,
		user,
		password,
		database,
		migrationsDir: join(root, 'migrations'),
	};
};

export default loadDatabaseConfig;

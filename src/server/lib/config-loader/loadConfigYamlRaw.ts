
import {join} from 'path';
import {readFile} from 'fs/promises';

import {parse} from 'yaml';

import {findPackageJsonDir} from '../../../common/util';

export type RawConfig = Record<PropertyKey, unknown>;

export const loadConfigYamlRaw = async (): Promise<RawConfig> => {
	const root = await findPackageJsonDir(__dirname);
	const path = join(root, 'config.yaml');
	const configJson = await readFile(path, 'utf-8');
	const config = parse(configJson) as unknown;

	if (typeof config !== 'object' || !config) {
		throw new Error(`invalid config, object expected in ${path}`);
	}

	return config as RawConfig;
};

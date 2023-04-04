import {has} from '../../../common/util';
import {type InstalledEventConfig} from '../routeCreation';
import ensureRecord from './ensureRecord';

export const getInstalledEventConfig = (conf: unknown): InstalledEventConfig => {
	ensureRecord(conf);

	if (!has('installed-event')(conf) || typeof conf['installed-event'] !== 'object') {
		throw new Error('Missing or invalid installed-event config key in config.yaml');
	}

	const installedEvent = conf['installed-event'] as Record<string, unknown>;

	if (!has('url')(installedEvent) || typeof installedEvent.url !== 'string') {
		throw new Error('Missing or invalid url key in installed-event config');
	}

	if (!has('token')(installedEvent) || typeof installedEvent.token !== 'string') {
		throw new Error('Missing or invalid token key in installed-event config');
	}

	return {
		url: installedEvent.url,
		token: installedEvent.token,
	};
};

export default getInstalledEventConfig;

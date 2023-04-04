import {has} from '../../../common/util';
import {type YouTubeConfig} from '../routeCreation';

import ensureRecord from './ensureRecord';

export const getYouTubeConfig = (conf: unknown): YouTubeConfig => {
	ensureRecord(conf);

	if (!has('youtube')(conf) || typeof conf.youtube !== 'object' || conf.youtube === null) {
		throw new Error('Missing or invalid youtube config key in config.yaml');
	}

	if (!has('key')(conf.youtube) || typeof conf.youtube.key !== 'string') {
		throw new Error('Missing or invalid key key in youtube config');
	}

	const {key} = conf.youtube;

	if (typeof key !== 'string') {
		throw new Error('Missing or invalid key key in youtube config');
	}

	return {
		apiKey: key,
	};
};

export default getYouTubeConfig;

import {has} from '../../../common/util';
import {type YouTubeConfig} from '../routeCreation';

import ensureRecord from './ensureRecord';

export const getYouTubeConfig = (conf: unknown): YouTubeConfig => {
	ensureRecord(conf);

	if (!has('YouTube')(conf) || typeof conf.YouTube !== 'object' || conf.YouTube === null) {
		throw new Error('Missing or invalid youtube config key in config.yaml');
	}

	if (!has('api-key')(conf.YouTube) || typeof conf.YouTube['api-key'] !== 'string') {
		throw new Error('Missing or invalid key key in youtube config');
	}

	const {'api-key': key} = conf.YouTube;

	if (typeof key !== 'string') {
		throw new Error('Missing or invalid key key in youtube config');
	}

	return {
		videosEndPoint: 'https://youtube.googleapis.com/youtube/v3/videos',
		apiKey: key,
	};
};

export default getYouTubeConfig;

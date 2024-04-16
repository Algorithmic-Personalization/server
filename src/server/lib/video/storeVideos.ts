import {type Repository} from 'typeorm';
import Video from '../../models/video';
import {validateNew} from '../../../common/util';
import type {RecommendationBase} from '../../../common/types/Recommendation';
import {cleanId} from '../cleanVideoIds';

export const makeVideosFromRecommendations = (recommendations: RecommendationBase[]): Video[] =>
	recommendations.map(r => {
		const v = new Video();
		v.youtubeId = cleanId(r.videoId);
		v.title = r.title;
		v.url = r.url;
		return v;
	});

export const _storeVideos = async (repo: Repository<Video>, videos: Video[]): Promise<number[]> => {
	const validationErrors = await Promise.all(videos.map(validateNew));
	const pairs = videos.map((v, i) => ({v, e: validationErrors[i]})).filter(({e}) => e.length > 0);
	if (pairs.length > 0) {
		throw new Error(`Validation errors: ${pairs.map(({v, e}) => `(video ${v.youtubeId}: ${e.join(', ')})`).join(', ')}.`);
	}

	const sanitized: Video[] = videos.map(v => ({
		...v,
		id: 0,
	}));

	const ids: number[] = [];

	for (const video of sanitized) {
		try {
			// eslint-disable-next-line no-await-in-loop
			const res = await repo.save(video);
			ids.push(res.id);
		} catch (e) {
			// eslint-disable-next-line no-await-in-loop
			const v = await repo.findOneBy({
				youtubeId: video.youtubeId,
			});

			if (v) {
				ids.push(v.id);
			} else {
				throw e;
			}
		}
	}

	return ids;
};

type YtIdMap = Map<string, number>;

export const storeVideos = async (repo: Repository<Video>, videos: Video[]): Promise<number[]> => {
	const validationErrors = await Promise.all(videos.map(validateNew));
	const pairs = videos.map((v, i) => ({v, e: validationErrors[i]})).filter(({e}) => e.length > 0);
	if (pairs.length > 0) {
		throw new Error(`Validation errors: ${pairs.map(({v, e}) => `(video ${v.youtubeId}: ${e.join(', ')})`).join(', ')}.`);
	}

	const sanitized: Video[] = videos.map(v => ({
		...v,
		id: 0,
	}));

	const ytIdMap: YtIdMap = new Map();

	const insertPromises: Array<Promise<Video>> = [];
	const readPromises: Array<Promise<Video>> = [];

	for (const video of sanitized) {
		insertPromises.push(repo.save(video));
	}

	const res = await Promise.allSettled(insertPromises);

	res.forEach((r, i) => {
		if (r.status === 'fulfilled') {
			ytIdMap.set(sanitized[i].youtubeId, r.value.id);
		} else {
			readPromises.push(repo.findOneBy({
				youtubeId: sanitized[i].youtubeId,
			}).then(v => {
				if (v) {
					ytIdMap.set(sanitized[i].youtubeId, v.id);
					return v;
				}

				throw new Error(`Could not find video with youtubeId ${sanitized[i].youtubeId}`);
			}));
		}
	});

	await Promise.all(readPromises);

	return videos.map(v => {
		const id = ytIdMap.get(v.youtubeId);

		if (id === undefined) {
			throw new Error(`Could not find video with youtubeId ${v.youtubeId}`);
		}

		return id;
	});
};

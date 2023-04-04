import {type Repository} from 'typeorm';
import Video from '../../models/video';
import {validateNew} from '../../../common/util';
import type Recommendation from '../../../common/types/Recommendation';

export const makeVideosFromRecommendations = (recommendations: Recommendation[]): Video[] =>
	recommendations.map(r => {
		const v = new Video();
		v.youtubeId = r.videoId;
		v.title = r.title;
		v.url = r.url;
		return v;
	});

export const storeVideos = async (repo: Repository<Video>, videos: Video[]): Promise<number[]> => {
	const ids: number[] = [];

	for (const video of videos) {
		// eslint-disable-next-line no-await-in-loop
		const existing = await repo.findOneBy({
			youtubeId: video.youtubeId,
		});

		if (existing) {
			ids.push(existing.id);
		} else {
			const newVideo = new Video();
			Object.assign(newVideo, video);
			// eslint-disable-next-line no-await-in-loop
			await validateNew(newVideo);
			// eslint-disable-next-line no-await-in-loop
			const saved = await repo.save(newVideo);
			ids.push(saved.id);
		}
	}

	return ids;
};

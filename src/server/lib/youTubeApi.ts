import fetch, {type Response} from 'node-fetch';
import {validate, IsString, IsInt, ValidateNested} from 'class-validator';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

export type YouTubeMeta = {
	videoId: string;
	categoryId: string;
	topicCategories: string[];
};

export type MetaMap = Map<string, YouTubeMeta>;

class PageInfo {
	@IsInt()
		totalResults = 0;

	@IsInt()
		resultsPerPage = 0;
}

class YouTubeResponse {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@ValidateNested()
		pageInfo: PageInfo = new PageInfo();

	@ValidateNested({each: true})
		items: Item[] = [];
}

class TopicDetails {
	@IsString({each: true})
		topicCategories: string[] = [];
}

class Snippet {
	@IsString()
		channelId = '';

	@IsString()
		categoryId = '';
}

class Item {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		topicDetails = new TopicDetails();

	@ValidateNested()
		snippet = new Snippet();
}

export type YouTubeResponseMeta = {
	hitRate: number;
	data: MetaMap;
};

// TODO: check db to see if we already have the data categories for these videos in db to prevent
// unnecessary calls to YouTube API
export const createApi = (config: YouTubeConfig, log: LogFunction) => {
	const fetching = new Map<string, Promise<Response>>();
	const cache: MetaMap = new Map();

	const url = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet`;

	return {
		async getTopicsAndCategories(youTubeIds: string[]): Promise<YouTubeResponseMeta> {
			const metaMap: MetaMap = new Map();

			const ids = youTubeIds.filter(id => !fetching.has(id) && !cache.has(id)).map(id => `id=${id}`).join('&');

			for (const id of youTubeIds) {
				const cached = cache.get(id);
				if (cached) {
					metaMap.set(id, cached);
				}
			}

			const hits = metaMap.size;

			const finalUrl = `${url}&${ids}`;
			const responseP = fetch(finalUrl, {
				method: 'GET',
				headers: {
					accept: 'application/json',
				},
			});

			for (const id of youTubeIds) {
				fetching.set(id, responseP);
			}

			const response = await responseP;

			const youTubeResponse = new YouTubeResponse();
			const rawResponse = await response.json() as unknown;
			// D log('Raw YouTube API response:', rawResponse);
			Object.assign(youTubeResponse, rawResponse);
			const thisBatchErrors = await validate(youTubeResponse);

			if (thisBatchErrors.length === 0) {
				for (const item of youTubeResponse.items) {
					const meta: YouTubeMeta = {
						videoId: item.id,
						categoryId: item.snippet.categoryId,
						topicCategories: item.topicDetails.topicCategories,
					};

					metaMap.set(item.id, meta);
				}
			} else {
				log('error(s) getting meta-data for videos:', thisBatchErrors);
			}

			const stillWaiting: Array<Promise<Response>> = [];

			for (const id of youTubeIds) {
				const p = fetching.get(id);

				if (p && p !== responseP) {
					stillWaiting.push(p);
				}
			}

			const responses = await Promise.all(stillWaiting);
			const objects = await Promise.all(responses.map(async r => r.json()));
			const previousResponses = objects.map(obj => {
				const ytResponse = new YouTubeResponse();
				Object.assign(ytResponse, obj);
				return ytResponse;
			});
			const previousErrors = await Promise.all(previousResponses.map(async yt => validate(yt)));

			previousErrors.forEach((errors, i) => {
				if (errors.length === 0) {
					for (const item of previousResponses[i].items) {
						metaMap.set(item.id, item.topicDetails.topicCategories);
					}
				}
			});

			for (const id of youTubeIds) {
				if (!metaMap.has(id)) {
					log('no category information found for video', id);
				}

				fetching.delete(id);
			}

			return {
				hitRate: Number(Math.round(100 * hits / youTubeIds.length).toFixed(2)),
				data: metaMap,
			};
		},
	};
};

export default createApi;

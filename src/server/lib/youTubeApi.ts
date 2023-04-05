import fetch, {type Response} from 'node-fetch';
import {validate, IsString, IsInt, ValidateNested} from 'class-validator';

import {type YouTubeConfig} from './routeCreation';
import {type LogFunction} from './logger';

export type YouTubeTopicCategories = Map<string, string[]>;

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

class Item {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		topicDetails = new TopicDetails();
}

// TODO: check db to see if we have the topic categories for these videos
export const createApi = (config: YouTubeConfig, log: LogFunction) => {
	const fetching = new Map<string, Promise<Response>>();
	const cache: YouTubeTopicCategories = new Map();

	const url = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails`;

	return {
		async getTopicCategories(youTubeIds: string[]): Promise<YouTubeTopicCategories> {
			const res: YouTubeTopicCategories = new Map();

			const ids = youTubeIds.filter(id => !fetching.has(id) && !cache.has(id)).map(id => `id=${id}`).join('&');

			for (const id of youTubeIds) {
				const cached = cache.get(id);
				if (cached) {
					res.set(id, cached);
				}
			}

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
			Object.assign(youTubeResponse, await response.json());
			const thisBatchErrors = await validate(youTubeResponse);

			if (thisBatchErrors.length === 0) {
				for (const item of youTubeResponse.items) {
					res.set(item.id, item.topicDetails.topicCategories);
				}
			} else {
				log('error getting category information for videos:', thisBatchErrors);
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
						res.set(item.id, item.topicDetails.topicCategories);
					}
				}
			});

			for (const id of youTubeIds) {
				if (!res.has(id)) {
					log('no category information found for video', id);
				}

				fetching.delete(id);
			}

			return res;
		},
	};
};

export default createApi;

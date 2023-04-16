import fetch, {type Response} from 'node-fetch';
import {validate, IsString, IsInt, ValidateNested, type ValidationError, IsBoolean} from 'class-validator';

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

class YouTubeResponse<T> {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@ValidateNested()
		pageInfo?: PageInfo;

	@ValidateNested({each: true})
		items: T[] = [];
}

class TopicDetails {
	@IsString({each: true})
		topicCategories: string[] = [];
}

class VideoSnippet {
	@IsString()
		channelId = '';

	@IsString()
		categoryId = '';
}

export class VideoListItem {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		topicDetails = new TopicDetails();

	@ValidateNested()
		snippet = new VideoSnippet();
}

class YouTubeVideoListResponse extends YouTubeResponse<VideoListItem> {
}

class CategorySnippet {
	@IsString()
		title = '';

	@IsBoolean()
		assignable = false;

	@IsString()
		channelId = '';
}

export class CategoryListItem {
	@IsString()
		kind = '';

	@IsString()
		etag = '';

	@IsString()
		id = '';

	@ValidateNested()
		snippet = new CategorySnippet();
}

class YouTubeCategoryListResponse extends YouTubeResponse<CategoryListItem> {
}

// Compute a percentage from 0 to 100 as a number, with two decimal places
const pct = (numerator: number, denominator: number): number =>
	Number(Math.round(100 * numerator / denominator).toFixed(2));

export type YouTubeResponseMeta = {
	requestTimeMs: number;
	hitRate: number;
	failRate: number;
	data: MetaMap;
};

// TODO:
// - fetch category names (we only have the ID for now)
// - what's the thing with the regions for categories?
// - store the data in DB
// - check db to see if we already have the meta data for a video
// 	 to avoid unnecessary calls to the YouTube API
export const makeCreateYouTubeApi = () => {
	type PromisedResponseMap = Map<string, Promise<Response>>;
	type PromisedResponseSet = Set<Promise<Response>>;

	const cache: MetaMap = new Map();
	const fetching: PromisedResponseMap = new Map();

	return (config: YouTubeConfig, log: LogFunction) => {
		const url = `${config.videosEndPoint}/?key=${config.apiKey}&part=topicDetails&part=snippet`;

		return {
			async getMetaFromVideoIds(youTubeVideoIdsMaybeNonUnique: string[]): Promise<YouTubeResponseMeta> {
				const tStart = Date.now();
				const metaMap: MetaMap = new Map();
				const promisesToWaitFor: PromisedResponseSet = new Set();

				const youTubeIds = [...new Set(youTubeVideoIdsMaybeNonUnique)];
				const newIdsToFetch: string[] = [];

				for (const id of youTubeIds) {
					const cached = cache.get(id);
					if (cached) {
						metaMap.set(id, cached);
						continue;
					}

					const alreadyFetching = fetching.get(id);
					if (alreadyFetching) {
						promisesToWaitFor.add(alreadyFetching);
						continue;
					}

					newIdsToFetch.push(id);
				}

				const hits = youTubeIds.length - newIdsToFetch.length;

				const idsUrlArgs = newIdsToFetch.map(id => `id=${id}`).join('&');
				const finalUrl = `${url}&${idsUrlArgs}`;
				const responseP = fetch(finalUrl, {
					method: 'GET',
					headers: {
						accept: 'application/json',
					},
				});

				for (const id of youTubeIds) {
					fetching.set(id, responseP);
					promisesToWaitFor.add(responseP);
				}

				const responses = await Promise.allSettled(promisesToWaitFor);

				const arrayResponses: Response[] = [];
				for (const response of responses) {
					if (response.status === 'rejected') {
						log('error getting some meta-data for videos:', response.reason);
					} else {
						arrayResponses.push(response.value);
					}
				}

				const rawResponses = await Promise.all(arrayResponses.map(async r => r.json()));

				const validationPromises: Array<Promise<ValidationError[]>> = [];
				const youTubeResponses: YouTubeVideoListResponse[] = [];

				for (const raw of rawResponses) {
					const youTubeResponse = new YouTubeVideoListResponse();
					Object.assign(youTubeResponse, raw);
					validationPromises.push(validate(youTubeResponse));
					youTubeResponses.push(youTubeResponse);
				}

				const validation = await Promise.allSettled(validationPromises);

				validation.forEach((validationResult, i) => {
					if (validationResult.status === 'rejected') {
						log('error validating some meta-data for videos:', validationResult.reason);
					} else {
						const errors = validationResult.value;
						if (errors.length === 0) {
							const youTubeResponse = youTubeResponses[i];
							for (const item of youTubeResponse.items) {
								console.log('item:', item);
								const meta: YouTubeMeta = {
									videoId: item.id,
									categoryId: item.snippet.categoryId,
									topicCategories: item.topicDetails.topicCategories,
								};
								metaMap.set(item.id, meta);
								cache.set(item.id, meta);
							}
						} else {
							log('errors validating some meta-data for videos:', errors);
						}
					}
				});

				const fetchedIds = new Set(metaMap.keys());
				const failedIds = youTubeIds.filter(id => !fetchedIds.has(id));
				failedIds.forEach(id => fetching.delete(id));

				const failRate = pct(failedIds.length, youTubeIds.length);
				const hitRate = pct(hits, youTubeIds.length);
				const requestTimeMs = Date.now() - tStart;

				return {
					failRate,
					hitRate,
					requestTimeMs,
					data: metaMap,
				};
			},

			async getCategoriesFromRegionCode(regionCode: string, hl = 'en'): Promise<CategoryListItem[]> {
				const url = `${config.categoriesEndPoint}/?key=${config.apiKey}&part=snippet&regionCode=${regionCode}&hl=${hl}`;

				const response = await fetch(url);
				const raw = await response.json() as unknown;

				const youTubeResponse = new YouTubeCategoryListResponse();
				Object.assign(youTubeResponse, raw);

				const errors = await validate(youTubeResponse);
				if (errors.length > 0) {
					throw new Error(`error validating YouTube category list response: ${errors.join(', ')}`);
				}

				return youTubeResponse.items;
			},
		};
	};
};

export default makeCreateYouTubeApi;

import {type DataSource} from 'typeorm';
import {type Request, type Response} from 'express';

import {type MailService} from './email';
import {type CreateLogger} from './logger';
import {type TokenTools} from './crypto';

import {has} from '../../common/util';
import NotFoundError from './notFoundError';
import {type ExternalNotifier as NotifierService} from './externalNotifier';

const hasMessage = has('message');
const message = (x: unknown) => (hasMessage(x) ? x.message : 'An unknown error occurred');

// From the documentation at: https://developers.google.com/youtube/v3/docs/videos/list
export type YouTubeConfig = {
	// The base URL for the YouTube API's `videos` endpoint,
	// always pass the 'Accept: application/json' header.
	//
	// To get the topicDetails pass ?part=topicDetails in a GET request,
	// and pass the YouTube Video IDs in the `id` query parameter,
	// you can pass many of them in one single request.
	videosEndPoint: string;

	categoriesEndPoint: string;

	// Use it in a header like this: `Authorization: Bearer ${apiKey}`
	// or as a key query parameter like this: `?key=${apiKey}`
	apiKey: string;
};

export type RouteContext = {
	dataSource: DataSource;
	mailer: MailService;
	createLogger: CreateLogger;
	tokenTools: TokenTools;
	youTubeConfig: YouTubeConfig;
	notifier: NotifierService;
};

export type RouteCreator = (context: RouteContext) => (req: Request, res: Response) => Promise<void>;

export type RequestHandler<Output> = (req: Request) => Promise<Output>;

export type HttpVerb = 'get' | 'post' | 'put' | 'delete';

export type RouteDefinition<Output> = {
	verb: HttpVerb;
	path: string;
	makeHandler: (context: RouteContext) => RequestHandler<Output>;
};

export const makeRouteConnector = (context: RouteContext) => <T>(definition: RouteDefinition<T>) => async (req: Request, res: Response) => {
	const {makeHandler} = definition;
	const handler = makeHandler(context);

	try {
		const value = await handler(req);
		res.json({
			kind: 'Success',
			value,
		});
	} catch (err) {
		if (err instanceof NotFoundError) {
			res.status(404).json({
				kind: 'Failure',
				message: message(err),
			});
			return;
		}

		res.status(500).json({
			kind: 'Failure',
			message: message(err),
		});
	}
};

export default RouteContext;

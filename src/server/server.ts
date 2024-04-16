import {readFile} from 'fs/promises';
import {join} from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import cors from 'cors';
import multer from 'multer';

import {Client} from 'pg';
import {DataSource} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {migrate} from 'postgres-migrations';

import {parse} from 'yaml';
import {validate} from 'class-validator';

import nodemailer from 'nodemailer';
import monitor from 'express-status-monitor';

import io from '@pm2/io';

import {getInteger, getString, has, findPackageJsonDir, validateNew} from '../common/util';

import Token from './models/token';
import RequestLog, {type HttpVerb} from './models/requestLog';

import SmtpConfig from './lib/smtpConfig';

import webpackConfig from '../../webpack.config';

import type RouteContext from './lib/routeCreation';
import {
	type RouteDefinition,
	makeRouteConnector as makeExpressHandlerCreator,
} from './lib/routeCreation';

import {makeCreateDefaultLogger as makeCreateLogger} from './lib/logger';
import {createTokenTools} from './lib/crypto';
import createAuthMiddleWare from './lib/authMiddleware';
import createParticipantMiddleware from './lib/participantMiddleware';
import updateCounters from './lib/updateCounters';
import DatabaseLogger from './lib/databaseLogger';

import {
	postCheckParticipantCode,
	postCreateSession,
	getParticipantConfig,
	postEvent,
} from '../common/clientRoutes';

import {
	postRegister,
	getVerifyEmailToken,
	postLogin,
	getAuthTest,
	postUploadParticipants,
	getParticipants,
	getParticipantOverview,
	getEventOverviews,
	getExperimentConfig,
	postExperimentConfig,
	getExperimentConfigHistory,
	getApiTokens,
	createApiToken,
	deleteApiToken,
	getEvents,
} from './serverRoutes';

import createRegisterRoute from './api/register';
import createVerifyEmailRoute from './api/verifyEmail';
import createLoginRoute from './api/login';
import createCreateApiTokenRoute from './api/createApiToken';
import createDeleteApiTokenRoute from './api/deleteApiToken';
import createGetApiTokensRoute from './api/getApiTokens';
import createAuthTestRoute from './api/authTest';
import createUploadParticipantsRoute from './api/uploadParticipants';
import createGetParticipantsRoute from './api/getParticipants';
import createGetParticipantOverviewRoute from './api/getParticipantOverview';
import createGetEventOverviewsRoute from './api/getEventOverviews';
import createGetExperimentConfigRoute from './api/getExperimentConfig';
import createPostExperimentConfigRoute from './api/postExperimentConfig';
import createGetExperimentConfigHistoryRoute from './api/getExperimentConfigHistory';
import createPostCheckParticipantCodeRoute from './api/checkParticipantCode';
import createCreateSessionRoute from './api/createSession';
import createGetParticipantConfigRoute from './api/participantConfig';
import createPostEventRoute from './api/postEvent';
import createGetEventsRoute from './api/getEvents';

import createParticipantDefinition from './api-2/participantCreate';
import updateParticipantDefinition from './api-2/participantUpdate';
import createGetActivityReportDefinition from './api-2/activityReportGet';
import createTransitionSettingDefinition from './api-2/transitionSettingsCreate';
import getTransitionSettingDefinition from './api-2/transitionSettingsGet';
import monitoringDefinition from './api-2/monitoringGetReport';
import participantsReportDefinition from './api-2/participantsGetReport';
import addVouchersDefinition from './api-2/voucherCreate';
import ResetPasswordDefinition from './api-2/passwordSendLink';
import resetPassword from './api-2/passwordReset';
import getChannelSourceForParticipant from './api-2/channelSourceGetForParticipant';
import createSanityCheckDefinition from './api-2/sanityCheck';

import getYouTubeConfig from './lib/config-loader/getYouTubeConfig';
import makeCreateYouTubeApi from './lib/youTubeApi';
import scrapeMissingYouTubeMetadata from './lib/scrapeYouTube';

import createChannelSourceDefinition from './api-2/channelSourceCreate';
import updateChannelSourceDefinition from './api-2/channelSourceUpdate';
import channelRotationSpeedSetDefinition from './api-2/channelRotationSpeedSet';
import channelRotationSpeedGetDefinition from './api-2/channelRotationSpeedGet';

// DO NOT FORGET TO UPDATE THIS FILE WHEN ADDING NEW ENTITIES
import entities from './entities';
import {loadConfigYamlRaw} from './lib/config-loader/loadConfigYamlRaw';
import {loadDatabaseConfig} from './lib/config-loader/loadDbConfig';

import createDefaultNotifier, {type ExternalNotifierDependencies as NotifierDependencies} from './lib/externalNotifier';
import {createMailService, type MailServiceDependencies, type MailService} from './lib/email';
import Participant from './models/participant';

import cleanVideoIds from './lib/cleanVideoIds';

export type Env = 'production' | 'development';

export const getEnv = (): Env => {
	const env = process.env.NODE_ENV;

	if (env !== 'production' && env !== 'development') {
		throw new Error('NODE_ENV must be set explicitly to either "production" or "development"');
	}

	return env;
};

const env = getEnv();

const upload = multer();

const currentRequests = io.counter({
	name: 'Realtime request count',
	id: 'app/realtime/request',
});

const slowQueries = io.meter({
	name: 'Slow queries',
	id: 'app/realtime/slowQueries',
});

export const logsDirName = 'logs';

const main = async () => {
	const root = await findPackageJsonDir(__dirname);
	const config = await loadConfigYamlRaw();

	const createLogger = makeCreateLogger(join(root, logsDirName, 'server.log'));
	const extraLogger = makeCreateLogger(join(root, logsDirName, 'extra.log'), false);
	const log = createLogger('<server>');

	process.on('unhandledRejection', err => {
		log('error', 'unhandled rejection:', err);
	});

	process.on('uncaughtException', err => {
		log('error', 'uncaught exception:', err);
	});

	const dockerComposeYaml = await readFile(join(root, 'docker-compose.yaml'), 'utf-8');
	const dockerComposeConfig = parse(dockerComposeYaml) as unknown;

	if (!config || typeof config !== 'object') {
		throw new Error('Invalid config.yml');
	}

	if (!has('smtp')(config)) {
		throw new Error('Missing smtp config in config.yml');
	}

	const smtpConfig = new SmtpConfig();
	Object.assign(smtpConfig, config.smtp);

	const smtpConfigErrors = await validate(smtpConfig);

	if (smtpConfigErrors.length > 0) {
		console.error('Invalid smtp config in config.yml', smtpConfigErrors);
		process.exit(1);
	}

	const transport = nodemailer.createTransport(smtpConfig);
	const mailServiceDependencies: MailServiceDependencies = {
		transport,
		from: smtpConfig.auth.user,
		log: createLogger('<mailer>'),
	};

	const mailer: MailService = createMailService(mailServiceDependencies);

	log('success', 'mailer created');

	if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
		throw new Error('Invalid docker-compose.yaml');
	}

	const portKey = `${env}-server-port`;

	const port = getInteger([portKey])(config);
	const dbPortString = getString(['services', `${env}-db`, 'ports', '0'])(dockerComposeConfig);
	const [dbHostPort, dbDockerPort] = dbPortString.split(':');

	const dbPort = env === 'development' ? Number(dbHostPort) : Number(dbDockerPort);

	if (!dbPort || !Number.isInteger(dbPort)) {
		throw new Error(`Invalid db port: ${dbPort}`);
	}

	const dbConfig = await loadDatabaseConfig({
		environnement: env,
		useDockerAddress: env === 'production',
	}, root);

	const pgClient = new Client(dbConfig);

	try {
		await pgClient.connect();
	} catch (err) {
		console.error(
			'Error connecting to the database with config',
			dbConfig,
			':',
			err,
			'is the db server running?',
		);
		process.exit(1);
	}

	try {
		const migrated = await migrate({client: pgClient}, join(root, 'migrations'));
		log('successfully', 'ran migrations:', migrated);
	} catch (err) {
		log('error', 'running migrations:', err);
		process.exit(1);
	}

	await pgClient.end();

	const dataSource = new DataSource({
		type: 'postgres',
		...dbConfig,
		username: dbConfig.user,
		synchronize: false,
		entities,
		namingStrategy: new SnakeNamingStrategy(),
		logging: true,
		maxQueryExecutionTime: 200,
		logger: new DatabaseLogger(createLogger('<database>'), slowQueries),
		extra: {
			/* D seems useless:
			connectionTimeoutMillis: 2000,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			query_timeout: 5000,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			statement_timeout: 5000,
	*/},
		/* D seems useless:
		poolErrorHandler(err) {
			dataSource.initialize().then(() => {
				log('info', 're-initialized data source');
			}).catch(err => {
				log('error', 're-initializing data source:', err);
			});

			log('error', 'pool error:', err);
		},
		*/
	});

	try {
		await dataSource.initialize();
	} catch (err) {
		console.error('Error initializing data source:', err);
		process.exit(1);
	}

	log('Successfully initialized data source');

	try {
		await updateCounters({
			dataSource,
			log: createLogger(0),
		});
	} catch (err) {
		log('error', 'updating activity counters:', err);
		process.exit(1);
	}

	const youTubeConfig = getYouTubeConfig(config);

	// Not using cache in the scraping process because we're not gonna ask twice for the same video data
	const ytApi = await makeCreateYouTubeApi('without-cache')(
		youTubeConfig,
		createLogger('<yt-api>'),
		dataSource,
	);

	await cleanVideoIds(dataSource, createLogger('<yt-cleaner>'));

	scrapeMissingYouTubeMetadata(dataSource, createLogger('<yt-scraper>'), ytApi)
		.then(() => {
			log('success', 'done scraping youtube metadata');
		})
		.catch(err => {
			log('error', 'scraping youtube metadata:', err);
		});

	const privateKey = await readFile(join(root, 'private.key'), 'utf-8');
	const tokenTools = createTokenTools(privateKey);

	const notifierServices: NotifierDependencies = {
		mailer,
		log: createLogger('<notifier>'),
		dataSource,
	};

	const notifier = createDefaultNotifier(config)(notifierServices);

	const routeContext: RouteContext = {
		dataSource,
		mailer,
		createLogger,
		tokenTools,
		youTubeConfig,
		notifier,
	};

	transport.sendMail({
		from: smtpConfig.auth.user,
		to: 'fm.de.jouvencel@gmail.com',
		subject: 'YTDPNL server started',
		text: `YTDPNL server started in ${env} mode`,
	}).catch(err => {
		log('error', 'an error occurred while sending a startup email', err);
	});

	const makeHandler = makeExpressHandlerCreator(routeContext);

	const tokenRepo = dataSource.getRepository(Token);

	const authMiddleware = createAuthMiddleWare({
		tokenRepo,
		tokenTools,
		createLogger,
	});

	const participantMw = createParticipantMiddleware({
		createLogger,
		extraLogger,
		dataSource,
	});

	const app = express();

	const staticRouter = express.Router();

	if (env === 'development') {
		const compiler = webpack(webpackConfig);

		if (!webpackConfig.output) {
			throw new Error('Invalid webpack config, missing output path');
		}

		staticRouter.use(webpackDevMiddleware(compiler));
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		staticRouter.use(webpackHotMiddleware(compiler as any));
	}

	app.use(cors());

	staticRouter.use(express.static(join(root, 'public')));

	app.use(staticRouter);

	app.use(bodyParser.json({
		limit: '50mb',
	}));

	let requestId = 0;
	let nCurrentRequests = 0;

	const logRepo = dataSource.getRepository(RequestLog);

	app.use((req, res, next) => {
		const tStart = Date.now();
		++requestId;
		++nCurrentRequests;
		req.requestId = requestId;
		const log = createLogger(req.requestId);
		currentRequests.inc();

		req.requestId = requestId;

		const {referer} = req.headers;

		log(req.method, req.url, {referer});

		res.on('finish', async () => {
			const tElapsed = Date.now() - tStart;

			log(`\x1b[94m{request #${requestId} response sent in ${tElapsed}ms}\x1b[0m`);

			currentRequests.dec();
			--nCurrentRequests;

			const logEntry = new RequestLog();
			logEntry.latencyMs = tElapsed;
			logEntry.requestId = requestId;
			logEntry.verb = req.method as HttpVerb;
			logEntry.path = req.path;

			const {sessionUuid} = req.body as {sessionUuid?: unknown};
			if (typeof sessionUuid === 'string' && sessionUuid) {
				logEntry.sessionUuid = sessionUuid;
			}

			logEntry.statusCode = res.statusCode;

			const {type} = req.body as {type?: unknown};
			if (typeof type === 'string') {
				logEntry.comment.push(`type: ${type}`);
			}

			try {
				const errors = await validateNew(logEntry);

				if (errors.length > 0) {
					log('error', 'invalid request log entry:', errors);
				} else {
					logRepo.save(logEntry).catch(err => {
						log('error', 'saving request log:', err);
					});
				}
			} catch (err) {
				log('error', 'saving request log:', (err as Error).message ?? 'unspecified');
			}
		});

		next();
	});

	const defineAdminRoute = <T>(def: RouteDefinition<T>) => {
		app[def.verb](def.path, authMiddleware, makeHandler(def));
	};

	const defineUnprotectedRoute = <T>(def: RouteDefinition<T>) => {
		app[def.verb](def.path, makeHandler(def));
	};

	const defineParticipantRoute = <T>(def: RouteDefinition<T>) => {
		app[def.verb](def.path, participantMw, makeHandler(def));
	};

	app.use(monitor({
		path: '/status',
	}));

	defineUnprotectedRoute(ResetPasswordDefinition);
	defineUnprotectedRoute(resetPassword);
	defineUnprotectedRoute(createSanityCheckDefinition);

	defineAdminRoute(createParticipantDefinition);
	defineAdminRoute(createGetActivityReportDefinition);
	defineAdminRoute(createTransitionSettingDefinition);
	defineAdminRoute(getTransitionSettingDefinition);
	defineAdminRoute(updateParticipantDefinition);
	defineAdminRoute(monitoringDefinition);
	defineAdminRoute(participantsReportDefinition);
	defineAdminRoute(addVouchersDefinition);
	defineAdminRoute(createChannelSourceDefinition);
	defineAdminRoute(updateChannelSourceDefinition);
	defineAdminRoute(channelRotationSpeedSetDefinition);
	defineAdminRoute(channelRotationSpeedGetDefinition);

	defineParticipantRoute(getChannelSourceForParticipant);

	app.post(postRegister, createRegisterRoute(routeContext));
	app.get(getVerifyEmailToken, createVerifyEmailRoute(routeContext));
	app.post(postLogin, createLoginRoute(routeContext));

	app.get(getApiTokens, authMiddleware, createGetApiTokensRoute(routeContext));
	app.post(createApiToken, authMiddleware, createCreateApiTokenRoute(routeContext));
	app.delete(deleteApiToken, authMiddleware, createDeleteApiTokenRoute(routeContext));

	app.get(getAuthTest, authMiddleware, createAuthTestRoute(routeContext));
	app.post(postUploadParticipants, authMiddleware, upload.single('participants'), createUploadParticipantsRoute(routeContext));
	app.get(`${getParticipants}/:page?`, authMiddleware, createGetParticipantsRoute(routeContext));
	app.get(`${getParticipantOverview}/:code`, authMiddleware, createGetParticipantOverviewRoute(routeContext));
	app.get(`${getEventOverviews}/:sessionUuid`, authMiddleware, createGetEventOverviewsRoute(routeContext));
	app.get(getExperimentConfig, authMiddleware, createGetExperimentConfigRoute(routeContext));
	app.post(postExperimentConfig, authMiddleware, createPostExperimentConfigRoute(routeContext));
	app.get(getExperimentConfigHistory, authMiddleware, createGetExperimentConfigHistoryRoute(routeContext));
	app.get(`${getEvents}/:page?`, authMiddleware, createGetEventsRoute(routeContext));

	app.post(postCheckParticipantCode, createPostCheckParticipantCodeRoute(routeContext));
	app.post(postCreateSession, participantMw, createCreateSessionRoute(routeContext));
	app.get(getParticipantConfig, participantMw, createGetParticipantConfigRoute(routeContext));
	app.post(postEvent, participantMw, createPostEventRoute(routeContext));

	app.get('/api/ping', async (_req, res) => {
		const participantsRepo = dataSource.getRepository(Participant);
		const participantCount = await participantsRepo.count();
		res.status(200).json({n: participantCount});
	});

	app.use((req, res, next) => {
		if (req.method === 'GET' && req.headers.accept?.startsWith('text/html')) {
			res.sendFile(join(root, 'public', 'index.html'));
			return;
		}

		next();
	});

	const server = app.listen(port, '0.0.0.0', () => {
		log('info', `server in "${env}" mode listening on port ${port}`);
	});

	process.on('SIGINT', () => {
		log('info', 'received SIGINT, exiting');
		new Promise((resolve, reject) => {
			server.getConnections((err, connections) => {
				if (err) {
					log('error', 'getting number of open connections', err);
					reject(err);
				}

				log('info', `closing ${connections} open connections`);
				server.close(() => {
					log('info', 'server closed');
					resolve(connections);
				});
			});
		}).then(connections => {
			log('info', 'exiting after closing (according to Express):', connections, 'connections');
			log('info', 'current requests at exit as computed by app:', nCurrentRequests);
			process.exit(0);
		}).catch(err => {
			log('error', 'error while closing server', err);
			process.exit(1);
		});
	});
};

main().catch(err => {
	console.error(err);
	process.exit(1);
});

import {readFile} from 'fs/promises';
import {createWriteStream} from 'fs';
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

import {getInteger, getString, has, findPackageJsonDir} from '../common/util';

import Admin from '../common/models/admin';
import Token from './models/token';
import Participant from '../common/models/participant';
import ExperimentConfig from '../common/models/experimentConfig';
import Session from '../common/models/session';
import Event from '../common/models/event';
import Video from './models/video';
import WatchTime from './models/watchTime';
import VideoListItem from './models/videoListItem';

import SmtpConfig from './lib/smtpConfig';

import webpackConfig from '../../webpack.config';

import type RouteContext from './lib/routeContext';
import {createDefaultLogger} from './lib/logger';
import {createTokenTools} from './lib/crypto';
import createAuthMiddleWare from './lib/authMiddleware';
import createParticipantMiddleware from './lib/participantMiddleware';

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
	postCheckParticipantCode,
	postCreateSession,
	getParticipantConfig,
	postEvent,
	getEvents,
} from '../common/routes';

import {
	getApiTokens,
	createApiToken,
	deleteApiToken,
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

// Add classes used by typeorm as models here
// so that typeorm can extract the metadata from them.
const entities = [
	Admin,
	Token,
	Participant,
	ExperimentConfig,
	Session,
	Event,
	Video,
	VideoListItem,
	WatchTime,
];

const env = process.env.NODE_ENV;

if (env !== 'production' && env !== 'development') {
	throw new Error('NODE_ENV must be set to "production" or "development"');
}

const upload = multer();

const start = async () => {
	const root = await findPackageJsonDir(__dirname);
	const logsPath = join(root, 'logs', 'server.log');
	const logStream = createWriteStream(logsPath, {flags: 'a'});
	console.log('Package root is:', root);
	const configJson = await readFile(join(root, 'config.yaml'), 'utf-8');
	const config = parse(configJson) as unknown;

	const dockerComposeJson = await readFile(join(root, 'docker-compose.yaml'), 'utf-8');
	const dockerComposeConfig = parse(dockerComposeJson) as unknown;

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

	const mailer = nodemailer.createTransport(smtpConfig);

	console.log('Mailer created:', mailer.transporter.name);

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

	const dbConfigPath = ['services', `${env}-db`, 'environment'];
	const dbHost = env === 'development' ? 'localhost' : `${env}-db`;
	const dbUser = getString([...dbConfigPath, 'POSTGRES_USER'])(dockerComposeConfig);
	const dbPassword = getString([...dbConfigPath, 'POSTGRES_PASSWORD'])(dockerComposeConfig);
	const dbDatabase = getString([...dbConfigPath, 'POSTGRES_DB'])(dockerComposeConfig);

	const dbConfig = {
		host: dbHost,
		port: dbPort,
		user: dbUser,
		password: dbPassword,
		database: dbDatabase,
	};

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
		console.log('Successfully ran migrations:', migrated);
	} catch (err) {
		console.error('Error running migrations:', err);
		process.exit(1);
	}

	await pgClient.end();

	const ds = new DataSource({
		type: 'postgres',
		...dbConfig,
		username: dbUser,
		synchronize: false,
		entities,
		namingStrategy: new SnakeNamingStrategy(),
	});

	try {
		await ds.initialize();
	} catch (err) {
		console.error('Error initializing data source:', err);
		process.exit(1);
	}

	console.log('Successfully initialized data source');

	const createLogger = createDefaultLogger(logStream);

	const privateKey = await readFile(join(root, 'private.key'), 'utf-8');
	const tokenTools = createTokenTools(privateKey);

	const routeContext: RouteContext = {
		dataSource: ds,
		mailer,
		mailerFrom: smtpConfig.auth.user,
		createLogger,
		tokenTools,
	};

	const tokenRepo = ds.getRepository(Token);

	const authMiddleware = createAuthMiddleWare({
		tokenRepo,
		tokenTools,
		createLogger,
	});

	const participantMw = createParticipantMiddleware(createLogger);

	const app = express();

	const staticRouter = express.Router();

	if (env === 'development') {
		const compiler = webpack(webpackConfig);

		if (!webpackConfig.output) {
			throw new Error('Invalid webpack config, missing output path');
		}

		staticRouter.use(webpackDevMiddleware(compiler));
		staticRouter.use(webpackHotMiddleware(compiler));
	}

	staticRouter.use(express.static(join(root, 'public')));

	app.use(staticRouter);

	app.use(bodyParser.json());
	app.use(cors());

	let requestId = 0;

	app.use((req, _res, next) => {
		++requestId;
		req.requestId = requestId;
		createLogger(req.requestId)(req.method, req.url);
		next();
	});

	app.post(postRegister, createRegisterRoute(routeContext));
	app.get(getVerifyEmailToken, createVerifyEmailRoute(routeContext));
	app.post(postLogin, createLoginRoute(routeContext));

	app.get(getApiTokens, authMiddleware, createGetApiTokensRoute(routeContext));
	app.post(createApiToken, authMiddleware, createCreateApiTokenRoute(routeContext));
	app.delete(deleteApiToken, authMiddleware, createDeleteApiTokenRoute(routeContext));

	app.get(getAuthTest, authMiddleware, createAuthTestRoute(routeContext));
	app.post(postUploadParticipants, authMiddleware, upload.single('participants'), createUploadParticipantsRoute(routeContext));
	app.get(`${getParticipants}/:page?`, authMiddleware, createGetParticipantsRoute(routeContext));
	app.get(`${getParticipantOverview}/:email`, authMiddleware, createGetParticipantOverviewRoute(routeContext));
	app.get(`${getEventOverviews}/:sessionUuid`, authMiddleware, createGetEventOverviewsRoute(routeContext));
	app.get(getExperimentConfig, authMiddleware, createGetExperimentConfigRoute(routeContext));
	app.post(postExperimentConfig, authMiddleware, createPostExperimentConfigRoute(routeContext));
	app.get(getExperimentConfigHistory, authMiddleware, createGetExperimentConfigHistoryRoute(routeContext));
	app.get(`${getEvents}/:page?`, authMiddleware, createGetEventsRoute(routeContext));

	app.post(postCheckParticipantCode, createPostCheckParticipantCodeRoute(routeContext));
	app.post(postCreateSession, participantMw, createCreateSessionRoute(routeContext));
	app.get(getParticipantConfig, participantMw, createGetParticipantConfigRoute(routeContext));
	app.post(postEvent, participantMw, createPostEventRoute(routeContext));

	app.use((req, res, next) => {
		if (req.method === 'GET' && req.headers.accept?.startsWith('text/html')) {
			res.sendFile(join(root, 'public', 'index.html'));
			return;
		}

		next();
	});

	app.listen(port, '0.0.0.0', () => {
		console.log(`Server in "${env}" mode listening on port ${port}`);
	});
};

start().catch(err => {
	console.error(err);
	process.exit(1);
});

import {migrate} from 'postgres-migrations';
import {DataSource} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import {Client} from 'pg';
import pgTools from 'pgtools';

import loadDatabaseConfig from '../lib/config-loader/loadDbConfig';
import entities from '../entities';
import Admin from '../../common/models/admin';
import ExperimentConfig from '../../common/models/experimentConfig';
import Participant from '../models/participant';
import Event from '../../common/models/event';
import Session from '../../common/models/session';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';
import {Phase} from '../../server/models/transitionSetting';
import {randomToken} from '../lib/crypto';

export type TestDb = {
	dataSource: DataSource;
	client: Client;
	tearDown: () => Promise<void>;
	createParticipant: () => Promise<Participant>;
	createSession: (participant: Participant) => Promise<Session>;
	createEvent: (session: Session) => Promise<Event>;
	createTransitionEvent: (participant: Participant) => TransitionEvent;
};

const resetDb = async (shortTimeout = false): Promise<TestDb> => {
	const dbConfig = await loadDatabaseConfig({
		environnement: 'test',
		useDockerAddress: false,
	});

	const {database: _ignored, ...dbConfigWithoutDatabase} = dbConfig;

	try {
		await pgTools.dropdb(dbConfigWithoutDatabase, 'ytdpnl');
	} catch (e) {
		console.log('dropdb before tests failed, not necessarily an issue, it may not exist', e);
	}

	await pgTools.createdb(dbConfigWithoutDatabase, 'ytdpnl');

	const client = new Client({
		...dbConfig,
	});
	await client.connect();

	await migrate(dbConfig, dbConfig.migrationsDir);

	const extra = shortTimeout ? {
		options: '-c lock_timeout=500ms',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		statement_timeout: 500,
	} : {};

	const dataSource = new DataSource({
		type: 'postgres',
		...dbConfig,
		username: dbConfig.user,
		synchronize: false,
		entities,
		namingStrategy: new SnakeNamingStrategy(),
		logging: false,
		maxQueryExecutionTime: 200,
		extra,
	});

	await dataSource.initialize();

	const createAdmin = async (): Promise<Admin> => {
		const admin = new Admin();
		admin.email = 'test@example.com';
		admin.name = 'Test Admin';
		admin.password = 'password';
		admin.verificationToken = randomToken(128);
		admin.emailVerified = true;
		const repo = dataSource.getRepository(Admin);
		const saved = await repo.save(admin);
		return saved;
	};

	const admin = await createAdmin();

	const createExperimentConfig = async (): Promise<ExperimentConfig> => {
		const experimentConfig = new ExperimentConfig();
		experimentConfig.adminId = admin.id;
		const repo = dataSource.getRepository(ExperimentConfig);
		const saved = await repo.save(experimentConfig);
		return saved;
	};

	const experimentConfig = await createExperimentConfig();

	const createParticipant = async (): Promise<Participant> => {
		const participant = new Participant();
		participant.code = randomToken(64);
		const repo = dataSource.getRepository(Participant);
		const saved = await repo.save(participant);
		return saved;
	};

	const createSession = async (participant: Participant): Promise<Session> => {
		const session = new Session();
		session.participantCode = participant.code;
		const repo = dataSource.getRepository(Session);
		const saved = await repo.save(session);
		return saved;
	};

	const createEvent = async (
		session: Session,
	): Promise<Event> => {
		const event = new Event();
		event.sessionUuid = session.uuid;
		event.experimentConfigId = experimentConfig.id;
		event.url = 'https://example.com';
		const repo = dataSource.getRepository(Event);
		const saved = await repo.save(event);
		return saved;
	};

	const createTransitionEvent = (
		p: Participant,
	): TransitionEvent => {
		const event = new TransitionEvent();
		event.participantId = p.id;
		event.fromPhase = Phase.PRE_EXPERIMENT;
		event.toPhase = Phase.EXPERIMENT;
		event.reason = TransitionReason.FORCED;
		return event;
	};

	const tearDown = async (): Promise<void> => {
		await client.end();
		await dataSource.destroy();
	};

	return {
		dataSource,
		client,
		createParticipant,
		createSession,
		createEvent,
		createTransitionEvent,
		tearDown,
	};
};

export default resetDb;

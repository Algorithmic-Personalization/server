import {type DataSource} from 'typeorm';

import {type RouteCreator} from '../lib/routeCreation';

import Participant from '../models/participant';
import type ParticipantOverview from '../projections/ParticipantOverview';
import type SessionOverview from '../projections/SessionOverview';

import Event from '../../common/models/event';
import Session from '../../common/models/session';

const firstDate = <T extends {createdAt: Date}>(a: T[]): Date => {
	if (a.length === 0) {
		return new Date(0);
	}

	return a[0].createdAt;
};

const lastDate = <T extends {createdAt: Date}>(a: T[]): Date => {
	if (a.length === 0) {
		return new Date(0);
	}

	return a[a.length - 1].createdAt;
};

export const asyncMap = <T, U>(array: T[]) => async (fn: (value: T) => Promise<U>): Promise<U[]> => {
	const result = [];

	// Voluntarily not doing it in parallel for now
	// in order to minimize server load
	for (const value of array) {
		// eslint-disable-next-line no-await-in-loop
		result.push(await fn(value));
	}

	return result;
};

const createSessionOverview = (dataSource: DataSource) => async (session: Session): Promise<SessionOverview> => {
	const eventRepo = dataSource.getRepository(Event);

	type QueryResult = {
		firstDate: Date;
		lastDate: Date;
		count: number;
	};

	const qResult = await eventRepo.createQueryBuilder()
		.select('MIN(created_at)', 'firstDate')
		.addSelect('MAX(created_at)', 'lastDate')
		.addSelect('COUNT(*)', 'count')
		.where('session_uuid = :sessionUuid', {sessionUuid: session.uuid})
		.getRawOne() as unknown as QueryResult | undefined;

	const startedAt = qResult ? qResult.firstDate : new Date(0);
	const endedAt = qResult ? qResult.lastDate : new Date(0);

	return {
		...session,
		startedAt,
		endedAt,
		eventCount: qResult ? qResult.count : 0,
	};
};

export const createGetParticipantOverviewRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received participant overview request');

	const participantRepo = dataSource.getRepository(Participant);

	const {code} = req.params;

	if (!code) {
		res.status(400).json({kind: 'Error', message: 'Missing email'});
		return;
	}

	const participant = await participantRepo.findOneBy({code});

	if (!participant) {
		res.status(404).json({kind: 'Error', message: 'Participant not found'});
		return;
	}

	const sessionRepo = dataSource.getRepository(Session);

	const sessions = await sessionRepo.find({
		where: {
			participantCode: participant.code,
		},
		order: {
			createdAt: 'DESC',
		},
	});

	log('Session count:', sessions.length);

	const participantOverview: ParticipantOverview = {
		...participant,
		sessionCount: sessions.length,
		firstSessionDate: firstDate(sessions),
		latestSessionDate: lastDate(sessions),
		sessions: await asyncMap<Session, SessionOverview>(sessions)(createSessionOverview(dataSource)),
	};

	res.status(200).json({kind: 'Success', value: participantOverview});
};

export default createGetParticipantOverviewRoute;

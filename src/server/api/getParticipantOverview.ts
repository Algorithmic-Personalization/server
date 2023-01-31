import {type DataSource} from 'typeorm';

import {type RouteCreator} from '../lib/routeContext';

import Participant from '../../common/models/participant';
import type ParticipantOverview from '../projections/ParticipantOverview';
import type SessionOverview from '../projections/SessionOverview';
import type EventOverview from '../projections/EventOverview';

import Event, {EventType} from '../../common/models/event';
import WatchTime from '../models/watchTime';
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

const asyncMap = <T, U>(array: T[]) => async (fn: (value: T) => Promise<U>): Promise<U[]> => {
	const result = [];

	// Voluntarily not doing it in parallel for now
	// in order to minimize server load
	for (const value of array) {
		// eslint-disable-next-line no-await-in-loop
		result.push(await fn(value));
	}

	return result;
};

const createEventOverview = (dataSource: DataSource) => async (event: Event): Promise<EventOverview> => {
	const overview: EventOverview = {...event};

	if (event.type === EventType.WATCH_TIME) {
		const watchtimeRepo = dataSource.getRepository(WatchTime);

		const watchtime = await watchtimeRepo.findOneBy({eventId: event.id});

		if (watchtime) {
			overview.data = {
				kind: 'watchtime',
				watchtime: watchtime.secondsWatched,
			};
		}
	}

	return overview;
};

const createSessionOverview = (dataSource: DataSource) => async (session: Session): Promise<SessionOverview> => {
	const eventRepo = dataSource.getRepository(Event);

	const events = await eventRepo.find({
		where: {
			sessionUuid: session.uuid,
		},
		order: {
			createdAt: 'ASC',
		},
	});

	return {
		...session,
		startedAt: firstDate(events),
		endedAt: lastDate(events),
		events: await asyncMap<Event, EventOverview>(events)(createEventOverview(dataSource)),
	};
};

export const createGetParticipantOverviewRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received participant overview request');

	const participantRepo = dataSource.getRepository(Participant);

	const {email} = req.params;

	if (!email) {
		res.status(400).json({kind: 'Error', message: 'Missing email'});
		return;
	}

	const participant = await participantRepo.findOneBy({email});

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

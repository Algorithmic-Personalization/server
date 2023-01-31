import {type RouteCreator} from '../lib/routeContext';

import Participant from '../../common/models/participant';
import type ParticipantOverview from '../projections/ParticipantOverview';
import Session from '../../common/models/session';

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
		firstSessionDate: sessions.length > 0 ? sessions[sessions.length - 1].createdAt : new Date(0),
		latestSessionDate: sessions.length > 0 ? sessions[0].createdAt : new Date(0),
	};

	res.status(200).json({kind: 'Success', value: participantOverview});
};

export default createGetParticipantOverviewRoute;

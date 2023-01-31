import {type RouteCreator} from '../lib/routeContext';

import Participant from '../../common/models/participant';
import type ParticipantOverview from '../projections/ParticipantOverview';

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

	const participantOverview: ParticipantOverview = {
		...participant,
		sessionCount: 0,
	};

	res.status(200).json({kind: 'Success', value: participantOverview});
};

export default createGetParticipantOverviewRoute;

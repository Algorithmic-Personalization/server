import {type RouteCreator} from '../lib/routeContext';

import Participant from '../../common/models/participant';
import ExperimentConfig from '../../common/models/experimentConfig';
import {type ExperimentConfig as IndividualConfig} from '../../common/createRecommendationsList';

export type ParticipantConfig = IndividualConfig & {
	experimentConfigId: number;
};

export const createGetParticipantConfigRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('Received get participant config request');

	const participantRepo = dataSource.getRepository(Participant);
	const configRepo = dataSource.getRepository(ExperimentConfig);

	const config = await configRepo.findOneBy({
		isCurrent: true,
	});

	if (!config) {
		log('No current config found');
		res.status(500).json({kind: 'Failure', message: 'No current config found'});
		return;
	}

	const participant = await participantRepo.findOneBy({
		code: req.participantCode,
	});

	if (!participant) {
		log('No participant found');
		res.status(500).json({kind: 'Failure', message: 'No participant found'});
		return;
	}

	const {arm} = participant;
	const {nonPersonalizedProbability} = config;

	const result: ParticipantConfig = {
		arm,
		nonPersonalizedProbability,
		experimentConfigId: config.id,
	};

	log('Sending participant config', result);

	res.send({kind: 'Success', value: result});
};

export default createGetParticipantConfigRoute;

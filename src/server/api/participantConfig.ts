import {type RouteCreator} from '../lib/routeCreation';

import Participant from '../models/participant';
import ExperimentConfig, {type ParticipantConfig} from '../../common/models/experimentConfig';

import {getParticipantChannelSource} from '../api-2/channelSourceGetForParticipant';

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

	const channelSource = await getParticipantChannelSource(
		dataSource.createQueryRunner(), log,
	)(participant);

	const {arm} = participant;
	const {nonPersonalizedProbability: configProbability} = config;

	const nonPersonalizedProbability = participant.phase === 1
		? configProbability
		: 0;

	const result: ParticipantConfig = {
		arm,
		nonPersonalizedProbability,
		experimentConfigId: config.id,
		phase: participant.phase,
		channelSource: channelSource.channelId,
	};

	log('Sending participant config', result);

	res.send({kind: 'Success', value: result});
};

export default createGetParticipantConfigRoute;

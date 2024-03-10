import {type RouteCreator} from '../lib/routeCreation';

import Participant from '../models/participant';
import ExperimentConfig, {type ParticipantConfig} from '../../common/models/experimentConfig';

import {updateIfNeededAndGetParticipantChannelSource} from '../api-2/channelSourceGetForParticipant';

export const createGetParticipantConfigRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received get participant config request');

	const qr = dataSource.createQueryRunner();

	try {
		await qr.connect();
		await qr.startTransaction();

		const participantRepo = qr.manager.getRepository(Participant);
		const configRepo = qr.manager.getRepository(ExperimentConfig);

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

		const channelSource = await updateIfNeededAndGetParticipantChannelSource(
			qr, log,
		)(participant);

		await qr.commitTransaction();

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
			pos: channelSource.pos,
		};

		log('Sending participant config', result);

		res.send({kind: 'Success', value: result});
	} catch (e) {
		if (qr.isTransactionActive) {
			await qr.rollbackTransaction();
		}

		log('error', 'Failed to get participant config', e);
		res.status(500).json({kind: 'Failure', message: 'Failed to get participant config'});
	} finally {
		await qr.release();
	}
};

export default createGetParticipantConfigRoute;

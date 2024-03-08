import {type QueryRunner} from 'typeorm';

import {getParticipantChannelSource as getParticipantChannelSourcePath} from '../../common/clientRoutes';
import {type ParticipantChannelSource} from '../../common/types/participantChannelSource';

import {type RouteDefinition} from '../lib/routeCreation';

import ChannelSourceItem from '../models/channelSourceItem';
import UnusableChannel from '../models/unusableChannel';
import Participant from '../models/participant';
import {type LogFunction} from '../lib/logger';

import {getRotationSpeed} from './channelRotationSpeedGet';

export const advanceParticipantPositionInChannelSource = (qr: QueryRunner, log: LogFunction) => async (participant: Participant): Promise<ParticipantChannelSource> => {
	const {channelSourceId, posInChannelSource, code, arm} = participant;

	if (arm === 'control') {
		log('error', 'participant is in control arm, not looking for a channel source');
		throw new Error('Participant is in control arm');
	}

	log(
		'info',
		'trying to advance participant',
		code,
		'from channel source',
		channelSourceId ?? 'default',
		'and position',
		posInChannelSource,
		'to',
		posInChannelSource + 1,
	);

	const repo = qr.manager.getRepository(ChannelSourceItem);

	const item = await repo.findOne({
		where: {
			channelSourceId,
			position: posInChannelSource + 1,
		},
	});

	if (item) {
		log('info', 'participant can be advanced, there are channels left');

		await qr.manager.update(Participant, participant.id, {
			posInChannelSource: posInChannelSource + 1,
			posInChannelSourceLastUpdatedAt: new Date(),
		});

		log(
			'success',
			'participant',
			code,
			'advanced successfully',
			'from channel source',
			channelSourceId ?? 'default',
			'and position',
			posInChannelSource,
			'to',
			posInChannelSource + 1,
		);
	} else {
		log(
			'info',
			'participant cannot be advanced, there are no channels left in this source',
			channelSourceId ?? 'default',
		);
	}

	return getParticipantChannelSource(qr, log)(participant.code);
};

type ParticipantCode = string;

export const getParticipantChannelSource = (qr: QueryRunner, log: LogFunction) => async (participant: Participant | ParticipantCode): Promise<ParticipantChannelSource> => {
	const getParticipant = async () => {
		if (typeof participant === 'string') {
			const p = await qr.manager.getRepository(Participant).findOne({
				where: {
					code: participant,
				},
				select: ['channelSourceId', 'posInChannelSource'],
			});

			if (!p) {
				throw new Error('Participant not found', {
					cause: 'NO_CHANNEL_SOURCE_FOUND',
				});
			}

			return p;
		}

		return participant;
	};

	const {channelSourceId, posInChannelSource} = await getParticipant();

	log(
		'info',
		'getting participant channel from source',
		channelSourceId ?? 'default',
		'and position',
		posInChannelSource,
	);

	const repo = qr.manager.getRepository(ChannelSourceItem);

	const item = await repo.findOne({
		where: {
			channelSourceId,
			position: posInChannelSource,
		},
	});

	if (item) {
		const res = {
			channelId: item.youtubeChannelId,
			pos: posInChannelSource,
		};

		log('success', 'participant channel source item found', res);

		return res;
	}

	throw new Error('Participant channel source item not found');
};

const isPositionUpdateNeeded = (qr: QueryRunner, log: LogFunction) => async (participant: Participant | ParticipantCode): Promise<boolean> => {
	const getParticipant = async () => {
		if (typeof participant === 'string') {
			const p = await qr.manager.getRepository(Participant).findOne({
				where: {
					code: participant,
				},
				select: ['channelSourceId', 'posInChannelSource', 'posInChannelSourceLastUpdatedAt'],
			});

			if (!p) {
				throw new Error('Participant not found');
			}

			return p;
		}

		return participant;
	};

	const {channelSourceId, posInChannelSource, posInChannelSourceLastUpdatedAt} = await getParticipant();

	log(
		'info',
		'checking if participant needs to be advanced from channel source',
		channelSourceId ?? 'default',
		'and position',
		posInChannelSource,
		'based on time alone',
	);

	const rotationSpeed = await getRotationSpeed(qr);

	log('info', 'channel rotation speed currently is', rotationSpeed.speedHours, 'hours');

	const dtDays = ((new Date()).getTime() - posInChannelSourceLastUpdatedAt.getTime())
		/ 1000 / 60 / 60 / 24;

	log('info', 'dtDays', dtDays);

	const res = dtDays >= rotationSpeed.speedHours / 24;

	if (res) {
		log('info', 'participant needs to be advanced');
	} else {
		log('info', 'participant does not need to be advanced');
	}

	return res;
};

const getParticipantChannelSourceDefinition: RouteDefinition<ParticipantChannelSource> = {
	verb: 'get',
	path: getParticipantChannelSourcePath,
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<ParticipantChannelSource> => {
		const log = createLogger(req.requestId);
		log('Received get channel source for participant request');

		const {participantCode} = req;
		const force = req.query.force === 'true';

		if (force) {
			log('info', 'the client requested to force the switch to the next channel');
		}

		if (typeof participantCode !== 'string') {
			throw new Error('Invalid participant code - should never happen cuz of middleware');
		}

		log('info', 'participant code', participantCode);

		const qr = dataSource.createQueryRunner();

		const posNeedsUpdate = isPositionUpdateNeeded(qr, log);
		const getChannelSource = getParticipantChannelSource(qr, log);

		if (force) {
			const invalidChannel = await getChannelSource(participantCode);

			dataSource.getRepository(UnusableChannel).createQueryBuilder().insert().values({
				youtubeChannelId: invalidChannel.channelId,
			}).orIgnore().execute()
				.then(() => {
					log('info', 'marked channel', invalidChannel.channelId, 'as unusable');
				})
				.catch(err => {
					log('error', 'failed to insert unusable channel', err);
				});
		}

		try {
			await qr.connect();
			await qr.startTransaction();

			const participant = await qr.manager.getRepository(Participant)
				.createQueryBuilder('participant')
				.useTransaction(true)
				.where('participant.code = :code', {code: participantCode})
				.getOne();

			if (!participant) {
				throw new Error('Participant not found');
			}

			const updateNeeded = force || await posNeedsUpdate(participant);

			if (updateNeeded) {
				const source = await advanceParticipantPositionInChannelSource(qr, log)(participant);
				await qr.commitTransaction();
				return source;
			}

			const res = await getChannelSource(participant);
			log('success', 'replying to client with', res);

			return res;
		} catch (err) {
			if (qr.isTransactionActive) {
				await qr.rollbackTransaction();
			}

			// This is to return a non error response in case a concurrent request
			// already did the job
			if (await posNeedsUpdate(participantCode)) {
				log('error', 'failed to advance participant in channel source', err);
				throw err;
			}

			const res = await getChannelSource(participantCode);
			log('success', 'participant channel source found', res);

			return res;
		} finally {
			await qr.release();
		}
	},
};

export default getParticipantChannelSourceDefinition;

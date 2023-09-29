/* eslint-disable no-await-in-loop */
import {type RouteCreator} from '../lib/routeCreation';

import {parse} from '../lib/csv';

import Participant from '../models/participant';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';
import {ExperimentArm} from '../../common/models/event';

import {isParticipantRecord, createSaveParticipantTransition} from '../lib/participant';

export const createUploadParticipantsRoute: RouteCreator = ({createLogger, dataSource, notifier}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received upload participants request');

	const handlePhaseUpdate = async (record: Record<PropertyKey, unknown>): Promise<boolean> => {
		const {code, phase} = record;

		if (!phase) {
			return false;
		}

		if (typeof code !== 'string') {
			throw new Error('invalid participant code, must be a string');
		}

		const nPhase = Number(phase);

		if (nPhase < 0 || nPhase > 2) {
			throw new Error('invalid phase, must be one of: 0, 1, 2');
		}

		const p = await dataSource.getRepository(Participant).findOneOrFail({
			where: {
				code,
			},
		});

		if (p.phase === nPhase) {
			return false;
		}

		const transition = new TransitionEvent();
		transition.fromPhase = p.phase;
		transition.toPhase = nPhase;
		transition.participantId = p.id;
		transition.reason = TransitionReason.FORCED;

		const saveTransition = createSaveParticipantTransition({
			dataSource,
			log,
			notifier: notifier.makeParticipantNotifier({
				participantCode: p.code,
				participantId: p.id,
				isPaid: p.isPaid,
			}),
		});

		await saveTransition(p, transition, undefined);

		return true;
	};

	const participants = req?.file?.buffer.toString('utf-8');

	if (!participants) {
		log('no participants received');
		res.status(400).json({kind: 'Failure', message: 'No participants file'});
		return;
	}

	const participantRepo = dataSource.getRepository(Participant);

	let nUpdated = 0;
	let nCreated = 0;
	let line = 1;
	const errorLines: number[] = [];

	const reply = () => {
		const messages: string[] = [];

		if (errorLines.length > 0) {
			messages.push(`Some records are invalid (${errorLines.length} total), at lines: ${errorLines.slice(0, 10).join(', ')}...`);
		}

		messages.push(`Created ${nCreated} new participants.`);
		messages.push(`Updated ${nUpdated} existing participants.`);

		const message = messages.join(' ');
		log('sending reply:', message);

		res.status(200).json({kind: 'Success', value: message});
	};

	try {
		const records = await parse(participants);
		for (const record of records) {
			line += 1;

			if (!isParticipantRecord(record)) {
				log('invalid record:', record);
				errorLines.push(line);
				continue;
			}

			const participant = new Participant();
			participant.code = record.code;
			participant.arm = record.arm === 'control' ? ExperimentArm.CONTROL : ExperimentArm.TREATMENT;
			participant.isPaid = record.isPaid === 1 || record.isPaid === '1';

			const existingParticipant = await participantRepo.findOneBy({code: participant.code});

			if (existingParticipant) {
				let updated = false;

				if (existingParticipant.arm !== participant.arm) {
					existingParticipant.arm = participant.arm;
					existingParticipant.updatedAt = new Date();

					// eslint-disable-next-line max-depth
					try {
						await participantRepo.save(existingParticipant);
						nUpdated += 1;
						updated = true;
					} catch (err) {
						log('failed to update participant:', err);
						errorLines.push(line);
						continue;
					}
				}

				if (await handlePhaseUpdate(record)) {
					updated ||= true;
				}

				if (updated) {
					nUpdated += 1;
				}
			} else {
				await participantRepo.save(participant);
				await handlePhaseUpdate(record);
				nCreated += 1;
			}
		}

		reply();
	} catch (err) {
		log('failed to parse participants:', err);
		res.status(400).json({kind: 'Failure', message: 'Failed to parse participants'});
	}
};

export default createUploadParticipantsRoute;

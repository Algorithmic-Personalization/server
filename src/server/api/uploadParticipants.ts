import {type RouteCreator} from '../lib/routeContext';

import {parse} from '../lib/csv';

import {has} from '../../common/util';

import Participant from '../models/participant';
import {ExperimentArm} from '../../common/models/event';

type ParticipantRecord = {
	email: string;
	code: string;
	arm: 'control' | 'treatment';
};

const isParticipantRecord = (record: Record<string, string>): record is ParticipantRecord =>
	has('email')(record)
	&& has('code')(record)
	&& has('arm')(record)
	&& typeof record.email === 'string'
	&& typeof record.code === 'string'
	&& record.email.length > 0
	&& record.code.length > 0
	&& (record.arm === 'control' || record.arm === 'treatment');

export const createUploadParticipantsRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received upload participants request');

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
			participant.email = record.email;
			participant.code = record.code;
			participant.arm = record.arm === 'control' ? ExperimentArm.CONTROL : ExperimentArm.TREATMENT;

			// eslint-disable-next-line no-await-in-loop
			const existingParticipant = await participantRepo.findOneBy({email: participant.email});

			if (existingParticipant) {
				if (existingParticipant.code !== participant.code || existingParticipant.arm !== participant.arm) {
					existingParticipant.code = participant.code;
					existingParticipant.arm = participant.arm;
					existingParticipant.updatedAt = new Date();

					// eslint-disable-next-line max-depth
					try {
						// eslint-disable-next-line no-await-in-loop
						await participantRepo.save(existingParticipant);
						nUpdated += 1;
					} catch (err) {
						log('failed to update participant:', err);
						errorLines.push(line);
					}
				}

				continue;
			}

			try {
				// eslint-disable-next-line no-await-in-loop
				await participantRepo.save(participant);
				nCreated += 1;
			} catch (err) {
				log('failed to save participant:', err);
				errorLines.push(line);
			}
		}

		reply();
	} catch (err) {
		log('failed to parse participants:', err);
		res.status(400).json({kind: 'Failure', message: 'Failed to parse participants'});
	}
};

export default createUploadParticipantsRoute;

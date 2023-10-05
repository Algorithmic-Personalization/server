import {type DataSource} from 'typeorm';
import {type QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

import Participant from '../models/participant';
import {has} from '../../common/util';
import {type ParticipantActivityHandler} from './externalNotifier';
import TransitionEvent, {TransitionReason} from '../models/transitionEvent';
import type Event from '../../common/models/event';
import {type LogFunction} from './logger';
import TransitionSetting from '../models/transitionSetting';

export type ParticipantRecord = {
	email: string;
	code: string;
	arm: 'control' | 'treatment';
	isPaid: 1 | undefined;
};

export const isParticipantRecord = (record: Record<string, string | number | undefined>): record is ParticipantRecord =>
	has('code')(record)
	&& has('arm')(record)
	&& typeof record.code === 'string'
	&& record.code.length > 0
	&& (record.arm === 'control' || record.arm === 'treatment');

export const createSaveParticipantTransition = ({
	dataSource,
	notifier,
	log,
}: {
	dataSource: DataSource;
	notifier: ParticipantActivityHandler;
	log: LogFunction;
}) => {
	const settingsRepo = dataSource.getRepository(TransitionSetting);

	return async (
		participant: Participant,
		transition: TransitionEvent,
		triggerEvent: Event | undefined,
	): Promise<TransitionEvent | undefined> => {
		log('info', 'transition to save:', transition);

		const {fromPhase, toPhase} = transition;
		const settings = await settingsRepo.findOne({
			where: {
				isCurrent: true,
				fromPhase,
				toPhase,
			},
		});

		if (!settings) {
			log('error', `no settings found for transition from ${fromPhase} to ${toPhase}`);
			return undefined;
		}

		try {
			return await dataSource.transaction('SERIALIZABLE', async entityManager => {
				const latestTransition = await entityManager.findOne(TransitionEvent, {
					where: {
						participantId: participant.id,
					},
					order: {
						id: 'DESC',
					},
				});

				if (latestTransition) {
					log('info', 'latest transition:', latestTransition);
				}

				if (latestTransition?.fromPhase === transition.fromPhase && latestTransition?.toPhase === transition.toPhase) {
					log('info', 'transition already saved, not adding another one');
					return undefined;
				}

				const intermediaryTransition = new TransitionEvent();
				Object.assign(intermediaryTransition, transition, {
					participantId: participant.id,
				});

				if (triggerEvent) {
					intermediaryTransition.eventId = triggerEvent.id;
					intermediaryTransition.reason = TransitionReason.AUTOMATIC;

					if (!settings) {
						log('error', 'no settings found for transition, aborting because it is not manual (was triggered by event)', {triggerEvent});
						throw new Error('no settings found for transition, aborting because it is not manual (was triggered by event)');
					}

					intermediaryTransition.transitionSettingId = settings.id;
				} else {
					intermediaryTransition.reason = TransitionReason.FORCED;
				}

				const participantUpdate: QueryDeepPartialEntity<Participant> = {
					phase: intermediaryTransition.toPhase,
				};

				log('info', 'updating participant phase:', participantUpdate);
				const p = await entityManager.update(
					Participant,
					{id: participant.id},
					participantUpdate,
				);
				log('info', 'participant now is:', p);

				log('info', 'saving transition:', intermediaryTransition);
				const t = await entityManager.save(intermediaryTransition);
				log('info', 'saved transition', t);

				await notifier.onPhaseChange(transition.createdAt, transition.fromPhase, transition.toPhase);
				log('success', 'completed phase transition!');
				return t;
			});
		} catch (error) {
			log('error', 'error saving transition', error);
		}

		return undefined;
	};
};

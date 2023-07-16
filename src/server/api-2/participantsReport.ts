/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */

import {type RouteDefinition} from '../lib/routeCreation';
import Participant from '../models/participant';
import TransitionEvent from '../models/transitionEvent';

type TransitionDates = {
	entered_intervention_at: number | null;
	entered_post_intervention_at: number | null;
	was_reset_to_pre_intervention_at: number | null;
};

type ParticipantsReportRow = {
	identifier: string;
	phase: number;
	activated_browser_extension_at: number | null;
} & TransitionDates;

type ParticipantsReport = ParticipantsReportRow[];

export const reportRoute: RouteDefinition<ParticipantsReport> = {
	verb: 'get',
	path: '/api/participants-report',
	makeHandler: ({dataSource, createLogger}) => async (req): Promise<ParticipantsReport> => {
		const log = createLogger(req.requestId);
		log('Received report request');

		const participantsRepo = dataSource.getRepository(Participant);

		const participants = await participantsRepo.find();

		const transitionsRepo = dataSource.getRepository(TransitionEvent);
		const transitions = await transitionsRepo.find({
			select: ['participantId', 'updatedAt', 'fromPhase', 'toPhase'],
			order: {
				id: 'ASC',
			},
		});

		const latestTransitionsMap = new Map<number, TransitionDates>();

		for (const transition of transitions) {
			const participantTransitions = latestTransitionsMap.get(transition.participantId) ?? {
				entered_intervention_at: null,
				entered_post_intervention_at: null,
				was_reset_to_pre_intervention_at: null,
			};

			if (transition.toPhase === 1) {
				participantTransitions.entered_intervention_at = transition.updatedAt.getTime();
			} else if (transition.toPhase === 2) {
				participantTransitions.entered_post_intervention_at = transition.updatedAt.getTime();
			} else if (transition.toPhase === 0) {
				participantTransitions.was_reset_to_pre_intervention_at = transition.updatedAt.getTime();
			}
		}

		const report: ParticipantsReport = participants.map(participant => ({
			identifier: participant.code,
			phase: participant.phase,
			activated_browser_extension_at: participant.extensionActivatedAt?.getTime() ?? null,
			entered_intervention_at: latestTransitionsMap.get(participant.id)?.entered_intervention_at ?? null,
			entered_post_intervention_at: latestTransitionsMap.get(participant.id)?.entered_post_intervention_at ?? null,
			was_reset_to_pre_intervention_at: latestTransitionsMap.get(participant.id)?.was_reset_to_pre_intervention_at ?? null,
		}));

		return report;
	},
};

export default reportRoute;

import {type LogFunction} from './logger';

export type ParticipantCode = string;

export type EmbeddedData =
	{activated_timestamp: number}
	| {intervention_period_timestamp: number};

export type ExternalEventUpdate = {
	responseId: ParticipantCode;
	embeddedData: EmbeddedData;
};

export type ExternalEventPayload = {
	updates: ExternalEventUpdate[];
	ignoreMissingResponses: false;
};

export type ExternalNotifier = {
	notifyActive: (d: Date) => Promise<boolean>;
	notifyInterventionPeriod: (d: Date) => Promise<boolean>;
};

export const createExternalNotifier = (
	_participantCode: string,
	_log: LogFunction,
): ExternalNotifier => ({
	async notifyActive(_d: Date) {
		return false;
	},
	async notifyInterventionPeriod(_d: Date) {
		return false;
	},
});

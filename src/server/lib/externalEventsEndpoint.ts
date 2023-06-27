import {has} from '../../common/util';
import {type LogFunction} from './logger';
import {type ExternalEventsEndpoint} from './routeCreation';
import ensureRecord from './config-loader/ensureRecord';
import fetch from 'node-fetch';

export const getExternalEventsEndpointConfig = (conf: unknown): ExternalEventsEndpoint => {
	ensureRecord(conf);

	if (!has('external-events-endpoint')(conf) || typeof conf['external-events-endpoint'] !== 'object') {
		throw new Error('Missing or invalid external-events-endpoint config key in config.yaml');
	}

	const extEndpoint = conf['external-events-endpoint'] as Record<string, unknown>;

	if (!has('url')(extEndpoint) || typeof extEndpoint.url !== 'string') {
		throw new Error('Missing or invalid url key in external-events-endpoint config');
	}

	if (!has('token')(extEndpoint) || typeof extEndpoint.token !== 'string') {
		throw new Error('Missing or invalid token key in external-events-endpoint config');
	}

	return {
		url: extEndpoint.url,
		token: extEndpoint.token,
	};
};

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
	config: ExternalEventsEndpoint,
	participantCode: string,
	log: LogFunction,
): ExternalNotifier => {
	const post = async (payload: ExternalEventPayload): Promise<boolean> => {
		try {
			const resp = await fetch(config.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-TOKEN': config.token,
				},
				body: JSON.stringify(payload),
			});

			if (resp.ok) {
				void resp.json().then(json => {
					log('success', 'notifying external server of', payload, 'got response', json);
				});
				return true;
			}

			void resp.json().then(json => {
				log('error', 'notifying external server of', payload, 'got response', json);
			});

			return false;
		} catch (err) {
			log('error', 'notifying external server:', err);
			return false;
		}
	};

	return {
		async notifyActive(d: Date) {
			const payload: ExternalEventPayload = {
				updates: [{
					responseId: participantCode,
					embeddedData: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						activated_timestamp: d.getTime(),
					},
				}],
				ignoreMissingResponses: false,
			};

			return post(payload);
		},
		async notifyInterventionPeriod(d: Date) {
			const payload: ExternalEventPayload = {
				updates: [{
					responseId: participantCode,
					embeddedData: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						intervention_period_timestamp: d.getTime(),
					},
				}],
				ignoreMissingResponses: false,
			};

			return post(payload);
		},
	};
};

export default getExternalEventsEndpointConfig;

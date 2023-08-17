import {type DataSource} from 'typeorm';
import fetch from 'node-fetch';

import {EventType} from '../../common/models/event';
import {has} from '../../common/util';
import {type LogFunction} from './logger';
import {type MailService} from './email';
import createVoucherService from '../lib/voucherService';

export type ExternalNotifierDependencies = {
	log: LogFunction;
	mailer: MailService;
	dataSource: DataSource;
};

// eslint-disable-next-line complexity
export const getExternalNotifierConfig = (generalConfigData: unknown): ExternalNotifierConfig => {
	if (!has('external-notifier')(generalConfigData) || !generalConfigData['external-notifier'] || typeof generalConfigData['external-notifier'] !== 'object') {
		throw new Error('missing external-notifier key in config');
	}

	const {'external-notifier': externalNotifier} = generalConfigData;

	if (!has('email')(externalNotifier) || !externalNotifier.email || typeof externalNotifier.email !== 'string') {
		throw new Error('missing or invalid email key in external-notifier config');
	}

	if (!has('token-url')(externalNotifier) || !externalNotifier['token-url'] || typeof externalNotifier['token-url'] !== 'string') {
		throw new Error('missing or invalid token-url key in external-notifier config');
	}

	if (!has('client-id')(externalNotifier) || !externalNotifier['client-id'] || typeof externalNotifier['client-id'] !== 'string') {
		throw new Error('missing or invalid client-id key in external-notifier config');
	}

	if (!has('client-secret')(externalNotifier) || !externalNotifier['client-secret'] || typeof externalNotifier['client-secret'] !== 'string') {
		throw new Error('missing or invalid client-secret key in external-notifier config');
	}

	if (!has('survey-id')(externalNotifier) || !externalNotifier['survey-id'] || typeof externalNotifier['survey-id'] !== 'string') {
		throw new Error('missing or invalid survey-id key in external-notifier config');
	}

	if (!has('update-url')(externalNotifier) || !externalNotifier['update-url'] || typeof externalNotifier['update-url'] !== 'string') {
		throw new Error('missing or invalid update-url key in external-notifier config');
	}

	return {
		email: externalNotifier.email,
		'token-url': externalNotifier['token-url'],
		'client-id': externalNotifier['client-id'],
		'client-secret': externalNotifier['client-secret'],
		'survey-id': externalNotifier['survey-id'],
		'update-url': externalNotifier['update-url'],
	};
};

export type ExternalNotifier = {
	makeParticipantNotifier: (data: ParticipantData) => ParticipantActivityHandler;
};

export type ParticipantActivityHandler = {
	onActive: (d: Date) => Promise<any>;
	onInstalled(d: Date): Promise<any>;
	onPhaseChange(d: Date, from: number, to: number): Promise<any>;
};

export type ExternalNotifierConfig = {
	email: string;
	'token-url': string;
	'update-url': string;
	'client-id': string;
	'client-secret': string;
	'survey-id': string;
};

export type ParticipantData = {
	participantId: number;
	participantCode: string;
	isPaid: boolean;
};

const makeOauthNotifier = (log: LogFunction) => (config: ExternalNotifierConfig) => {
	const preAuth = `${config['client-id']}:${config['client-secret']}`;
	const auth = Buffer.from(preAuth).toString('base64');

	let theToken: string;

	const getToken = async () => fetch(config['token-url'], {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Authorization: `Basic ${auth}`,
		},
		body: 'grant_type=client_credentials&scope=write:survey_responses',
	}).then(async res => {
		const data = await res.json() as Record<string, unknown>;

		if (!data || typeof data !== 'object') {
			throw new Error('invalid response from token endpoint');
		}

		const {expires_in: expiresIn, access_token: accessToken} = data;

		if (!expiresIn || typeof expiresIn !== 'number') {
			throw new Error('invalid response from token endpoint (missing expires_in)');
		}

		if (!accessToken || typeof accessToken !== 'string') {
			throw new Error('invalid response from token endpoint (missing access_token)');
		}

		log('success', '<oauth>', 'got token', `${accessToken.substring(accessToken.length / 3)}...`, 'expires in', expiresIn);

		return {accessToken, expiresIn};
	});

	const refreshToken = async () => {
		const data = await getToken();
		theToken = data.accessToken;
		setTimeout(refreshToken, Math.max(
			data.expiresIn - (60 * 5),
			0,
		) * 1000);
	};

	const ensureToken = async () => {
		if (!theToken) {
			await refreshToken();
		}

		return theToken;
	};

	const put = async (participantCode: string, data: Record<string, unknown>) => {
		const token = await ensureToken();

		const res = await fetch(config['update-url'].replace('{RESPONSE_ID}', participantCode), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			throw new Error('failed to update data');
		}

		return res.json();
	};

	const notifyInstalled = async (d: Date, participantCode: string) => {
		const data = {
			surveyId: config['survey-id'],
			resetRecordedDate: true,
			embeddedData: {
				installedExtensionAt: d.getTime(),
			},
		};

		log('info', '<oauth>', 'notifyInstalled', data);
		try {
			const res = await put(participantCode, data) as unknown;
			log('success', '<oauth>', 'notifyInstalled', res);
		} catch (e) {
			log('error', '<oauth>', 'notifyInstalled', e);
		}
	};

	const notifyActive = async (d: Date, participantCode: string, voucherCode: string) => {
		const data = {
			surveyId: config['survey-id'],
			resetRecordedDate: true,
			embeddedData: {
				activatedExtensionAt: d.getTime(),
				voucherCode,
			},
		};

		log('info', '<oauth>', 'notifyActive', data);
		try {
			const res = await put(participantCode, data) as unknown;
			log('success', '<oauth>', 'notifyActive', res);
		} catch (e) {
			log('error', '<oauth>', 'notifyActive', e);
		}
	};

	const notifyPhaseChanged = async (date: Date, participantCode: string, from: number, to: number) => {
		const data = {
			surveyId: config['survey-id'],
			resetRecordedDate: true,
			embeddedData: {
				fromPhase: from,
				toPhase: to,
				phaseChangedAt: date.getTime(),
			},
		};

		log('info', '<oauth>', 'notifyPhaseChanged', data);
		try {
			const res = await put(participantCode, data) as unknown;
			log('success', '<oauth>', 'notifyPhaseChanged', res);
		} catch (e) {
			log('error', '<oauth>', 'notifyPhaseChanged', e);
		}
	};

	return {notifyActive, notifyPhaseChanged, notifyInstalled};
};

export const makeDefaultExternalNotifier = (config: ExternalNotifierConfig) =>
	({mailer, dataSource, log}: ExternalNotifierDependencies): ExternalNotifier => {
		const voucherService = createVoucherService({
			dataSource,
			log,
		});

		log('info', 'creating external notifier', config);

		const oauth = makeOauthNotifier(log)(config);

		return {
			makeParticipantNotifier: (data: ParticipantData): ParticipantActivityHandler => ({
				async onActive(d: Date) {
					const {email: to} = config;
					const subject = `"${EventType.PHASE_TRANSITION}}" Update for User "${data.participantCode}"`;

					const getCode = async () => {
						const voucher = await voucherService.getAndMarkOneAsUsed(data.participantId);
						return voucher?.voucherCode ?? '<no vouchers left>';
					};

					const voucherString = data.isPaid ? await getCode() : '<participant not paid>';

					const text = `Participant "${
						data.participantCode
					}" "${
						EventType.EXTENSION_ACTIVATED
					}" as of "${d.getTime()}" VoucherCode sent: "${voucherString}"`;

					await Promise.all([
						mailer({to, subject, text}),
						oauth.notifyActive(d, data.participantCode, voucherString),
					]);
				},
				async onInstalled(d: Date) {
					const {email: to} = config;
					const {participantCode} = data;
					const subject = `"${EventType.EXTENSION_INSTALLED}" Update for User "${participantCode}"`;
					const text = `Participant "${participantCode}" "${EventType.EXTENSION_INSTALLED}" as of "${d.getTime()}"`;
					await Promise.all([
						mailer({to, subject, text}),
						oauth.notifyInstalled(d, participantCode),
					]);
				},
				async onPhaseChange(d: Date, from_phase: number, to_phase: number) {
					const {email: to} = config;
					const subject = `"${EventType.PHASE_TRANSITION}}" Update for User "${data.participantCode}"`;
					const text = `Participant "${data.participantCode}" transitioned from phase "${from_phase}" to phase "${to_phase}" on "${d.getTime()}"`;
					await Promise.all([
						mailer({to, subject, text}),
						oauth.notifyPhaseChanged(d, data.participantCode, from_phase, to_phase),
					]);
				},
			}),
		};
	};

export const createDefaultNotifier = (config: unknown) => (services: ExternalNotifierDependencies) => {
	const notifierConf = getExternalNotifierConfig(config);
	return makeDefaultExternalNotifier(notifierConf)(services);
};

export default createDefaultNotifier;

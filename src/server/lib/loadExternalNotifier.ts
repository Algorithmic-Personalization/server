import {has} from '../../common/util';
import {type LogFunction} from './logger';
import {type MailService} from './routeCreation';

export type ExternalNotifierConfig = {
	email: string;
};

export type NotifierServices = {
	log: LogFunction;
	mailer: MailService;
};

export const getExternalNotifierConfig = (generalConfigData: unknown): ExternalNotifierConfig => {
	if (!has('external-notifier')(generalConfigData) || !generalConfigData['external-notifier'] || typeof generalConfigData['external-notifier'] !== 'object') {
		throw new Error('missing external-notifier key in config');
	}

	const {'external-notifier': externalNotifier} = generalConfigData;

	if (!has('email')(externalNotifier) || !externalNotifier.email || typeof externalNotifier.email !== 'string') {
		throw new Error('missing or invalid email key in external-notifier config');
	}

	return {
		email: externalNotifier.email,
	};
};

export type ExternalNotifier = {
	notifyActive: (d: Date) => Promise<boolean>;
	notifyInstalled(d: Date): Promise<boolean>;
	notifyPhaseChange(d: Date, participantCode: string, from: number, to: number): Promise<boolean>;
};

// TODO implement, THEY ARE NO-OPS FOR NOW
export const makeDefaultExternalNotifier = (_config: ExternalNotifierConfig): ExternalNotifier => ({
	notifyActive: async () => true,
	notifyInstalled: async () => true,
	notifyPhaseChange: async () => true,
});

export const createDefaultNotifier = (config: unknown, services: NotifierServices): ExternalNotifier => {
	const notifierConf = getExternalNotifierConfig(config);
	return makeDefaultExternalNotifier(notifierConf);
};

export default createDefaultNotifier;

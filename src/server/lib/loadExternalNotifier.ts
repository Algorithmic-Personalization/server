import {EventType} from './../../common/models/event';
import {has} from '../../common/util';
import {type LogFunction} from './logger';
import {type MailService} from './email';

export type ExternalNotifierDependencies = {
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
	makeParticipantNotifier: (data: ParticipantData) => ParticipantNotifier;
};

export type ParticipantNotifier = {
	notifyActive: (d: Date) => Promise<boolean>;
	notifyInstalled(d: Date): Promise<boolean>;
	notifyPhaseChange(d: Date, from: number, to: number): Promise<boolean>;
};

export type ExternalNotifierConfig = {
	email: string;
};

export type ParticipantData = {
	participantCode: string;
};

// TODO implement, THEY ARE NO-OPS FOR NOW
export const makeDefaultExternalNotifier = (config: ExternalNotifierConfig) =>
	({mailer}: ExternalNotifierDependencies): ExternalNotifier => ({
		makeParticipantNotifier: (data: ParticipantData): ParticipantNotifier => ({
			async notifyActive(d: Date) {
				const {email: to} = config;
				const subject = `<${EventType.PHASE_TRANSITION}}> Update for User <${data.participantCode}>`;
				const text = `Participant <${data.participantCode}> <${EventType.EXTENSION_ACTIVATED}> as of <${d.getTime()}>`;
				return mailer({to, subject, text});
			},
			async notifyInstalled(d: Date) {
				const {email: to} = config;
				const subject = `<${EventType.EXTENSION_INSTALLED}}> Update for User <${data.participantCode}>`;
				const text = `Participant <${data.participantCode}> <${EventType.EXTENSION_INSTALLED}> as of <${d.getTime()}>`;
				return mailer({to, subject, text});
			},
			async notifyPhaseChange(d: Date, from_phase: number, to_phase: number) {
				const {email: to} = config;
				const subject = `<${EventType.PHASE_TRANSITION}}> Update for User <${data.participantCode}>`;
				const text = `Participant <${data.participantCode}> transitioned from phase <${from_phase} to phase <${to_phase}> on <${d.getTime()}>`;
				return mailer({to, subject, text});
			},
		}),
	});

export const createDefaultNotifier = (config: unknown) => (services: ExternalNotifierDependencies) => {
	const notifierConf = getExternalNotifierConfig(config);
	return makeDefaultExternalNotifier(notifierConf)(services);
};

export default createDefaultNotifier;

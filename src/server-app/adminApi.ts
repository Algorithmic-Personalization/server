import type {Page} from '../server/lib/pagination';

import {type Admin} from '../common/models/admin';
import {type Token} from '../server/models/token';
import {type Participant} from '../server/models/participant';
import {type LoginResponse} from '../server/api/login';
import {type ExperimentConfig} from '../common/models/experimentConfig';
import {type Event} from '../common/models/event';
import {type TransitionSetting} from '../server/models/transitionSetting';
import type ParticipantOverview from '../server/projections/ParticipantOverview';
import type EventOverview from '../server/projections/EventOverview';

import {
	postRegister,
	postLogin,
	getAuthTest,
	postUploadParticipants,
	getParticipants,
	getParticipantOverview,
	getExperimentConfig,
	getExperimentConfigHistory,
	getEvents,
	getEventOverviews,
	getApiTokens,
	createApiToken,
	deleteApiToken,
} from '../server/serverRoutes';

import {
	type ActivityReport,
	createGetActivityReportDefinition,
} from '../server/api-2/getActivityReport';

import {
	createTransitionSettingDefinition,
} from '../server/api-2/createTransitionSetting';

import {
	getTransitionSettingDefinition,
} from '../server/api-2/getTransitionSetting';

import {
	updateParticipantDefinition,
} from '../server/api-2/updateParticipant';

import {
	type Maybe,
	isMaybe,
	getMessage,
	makeApiVerbCreator,
} from '../common/util';

export type AdminApi = {
	isLoggedIn: () => boolean;
	wasLoggedIn: () => boolean;
	setAuth: (token: Token, admin: Admin) => void;
	login: (username: string, password: string) => Promise<Maybe<LoginResponse>>;
	register: (admin: Admin) => Promise<Maybe<string>>;
	getAdmin: () => Admin | undefined;
	getAuthTest: () => Promise<Maybe<Admin>>;
	uploadParticipants: (file: File) => Promise<Maybe<string>>;
	getParticipants: (page: number, codeLike: string, pageSize?: number) => Promise<Maybe<Page<Participant>>>;
	getParticipantOverview: (participantCode: string) => Promise<Maybe<ParticipantOverview>>;
	getEventOverviews: (sessionUuid: string) => Promise<Maybe<EventOverview[]>>;
	getEvents: (page: number, pageSize?: number) => Promise<Maybe<Page<Event>>>;
	getExperimentConfig: () => Promise<Maybe<ExperimentConfig>>;
	postExperimentConfig: (config: ExperimentConfig) => Promise<Maybe<ExperimentConfig>>;
	getExperimentConfigHistory: () => Promise<Maybe<ExperimentConfig[]>>;
	getApiTokens: () => Promise<Maybe<Token[]>>;
	createApiToken: (name: string) => Promise<Maybe<Token>>;
	deleteApiToken: (token: string) => Promise<Maybe<string>>;
	getActivityReport: () => Promise<Maybe<ActivityReport>>;
	createTransitionSetting: (setting: TransitionSetting) => Promise<Maybe<TransitionSetting>>;
	getTransitionSetting: (from: number, to: number) => Promise<Maybe<TransitionSetting>>;
	updateParticipantPhase: (participantCode: string, phase: number) => Promise<Maybe<Participant>>;
};

const loadItem = <T>(key: string): T | undefined => {
	const item = sessionStorage.getItem(key);

	if (!item) {
		return undefined;
	}

	return JSON.parse(item) as T;
};

type Verb = <T>(url: string, data: unknown, headers: Record<string, string>) => Promise<Maybe<T>>;
type VerbDecorator = (verb: Verb) => Verb;

export const createAdminApi = (serverUrl: string, showLoginModal?: () => void): AdminApi => {
	console.log('adminApi', serverUrl);

	let token = loadItem<Token>('token');
	let admin = loadItem<Admin>('admin');

	const verb = makeApiVerbCreator(serverUrl);

	const wasLoggedIn = () => sessionStorage.getItem('wasLoggedIn') === 'true';

	const decorate: VerbDecorator = verb => async <T>(url: string, data: unknown, h: Record<string, string>): Promise<Maybe<T>> => {
		const result = await verb<T>(url, data, h);

		if (isMaybe(result)) {
			if (result.kind === 'Failure') {
				if (result.code === 'NOT_AUTHENTICATED' && wasLoggedIn()) {
					token = undefined;
					admin = undefined;
					sessionStorage.removeItem('token');
					sessionStorage.removeItem('admin');
					if (showLoginModal) {
						showLoginModal();
					}
				}
			}
		}

		return result;
	};

	const get = decorate(verb('GET'));
	const post = decorate(verb('POST'));
	const del = decorate(verb('DELETE'));
	const put = decorate(verb('PUT'));

	const headers = () => ({
		'Content-Type': 'application/json',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Authorization: `${token?.token ?? ''}`,
	});

	return {
		getAdmin() {
			return admin;
		},

		isLoggedIn() {
			return Boolean(token) && Boolean(admin);
		},

		wasLoggedIn() {
			return wasLoggedIn();
		},

		setAuth(t: Token, a: Admin) {
			token = t;
			admin = a;
			sessionStorage.setItem('token', JSON.stringify(t));
			sessionStorage.setItem('admin', JSON.stringify(a));
			sessionStorage.setItem('wasLoggedIn', 'true');
		},

		async login(email: string, password: string) {
			return post<LoginResponse>(postLogin, {email, password}, headers());
		},

		async register(admin: Admin) {
			return post<string>(postRegister, admin, headers());
		},

		async getAuthTest() {
			return get<Admin>(getAuthTest, {}, headers());
		},

		async uploadParticipants(file: File) {
			const formData = new FormData();
			formData.set('participants', file);

			const result = await fetch(`${serverUrl}${postUploadParticipants}`, {
				method: 'POST',
				body: formData,
				headers: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					Authorization: `${token?.token ?? ''}`,
				},
			});

			try {
				const json = await result.json() as unknown;

				if (isMaybe<string>(json)) {
					return json;
				}
			} catch (e) {
				console.error(e);
				return {
					kind: 'Failure',
					message: `Invalid response from server: ${getMessage(e, 'unknown error')}`,
				};
			}

			return {
				kind: 'Failure',
				message: 'Invalid response from server',
			};
		},

		async getParticipants(page: number, codeLike: string, pageSize = 15) {
			return get<Page<Participant>>(
				`${getParticipants}/${page}`,
				{pageSize, codeLike},
				headers(),
			);
		},

		async getParticipantOverview(participantCode: string) {
			return get<ParticipantOverview>(`${getParticipantOverview}/${participantCode}`, {}, headers());
		},

		async getEventOverviews(sessionUuid: string) {
			return get<EventOverview[]>(`${getEventOverviews}/${sessionUuid}`, {}, headers());
		},

		async getEvents(page = 0, pageSize = 15) {
			return get<Page<Event>>(`${getEvents}/${page}`, {pageSize}, headers());
		},

		async getExperimentConfig() {
			return get<ExperimentConfig>(getExperimentConfig, {}, headers());
		},

		async postExperimentConfig(config: ExperimentConfig) {
			return post<ExperimentConfig>(getExperimentConfig, config, headers());
		},

		async getExperimentConfigHistory() {
			return get<ExperimentConfig[]>(getExperimentConfigHistory, {}, headers());
		},

		async getApiTokens() {
			return get<Token[]>(getApiTokens, {}, headers());
		},

		async createApiToken(name: string) {
			return post<Token>(createApiToken, {name}, headers());
		},

		async deleteApiToken(token: string) {
			return del<string>(deleteApiToken.replace(':token', token), {}, headers());
		},

		async getActivityReport() {
			return get<ActivityReport>(createGetActivityReportDefinition.path, {}, headers());
		},

		async createTransitionSetting(setting: TransitionSetting) {
			return post<TransitionSetting>(createTransitionSettingDefinition.path, setting, headers());
		},

		async getTransitionSetting(from: number, to: number) {
			const {path} = getTransitionSettingDefinition;
			return get<TransitionSetting>(path, {from, to}, headers());
		},

		async updateParticipantPhase(participantCode: string, phase: number) {
			const {path} = updateParticipantDefinition;
			return put<Participant>(
				path.replace(':code', participantCode),
				{phase},
				headers(),
			);
		},
	};
};

export default AdminApi;

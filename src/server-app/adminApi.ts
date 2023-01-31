import type {Page} from '../server/lib/pagination';

import {type Admin} from '../common/models/admin';
import {type Token} from '../server/models/token';
import {type Participant} from '../common/models/participant';
import {type LoginResponse} from '../server/api/login';
import {type ExperimentConfig} from '../common/models/experimentConfig';
import {type Event} from '../common/models/event';
import type ParticipantOverview from '../server/projections/ParticipantOverview';

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
} from '../common/routes';

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
	getParticipants: (page: number, emailLike: string, pageSize?: number) => Promise<Maybe<Page<Participant>>>;
	getParticipantOverview: (participantEmail: string) => Promise<Maybe<ParticipantOverview>>;
	getEvents: (page: number, pageSize?: number) => Promise<Maybe<Page<Event>>>;
	getExperimentConfig: () => Promise<Maybe<ExperimentConfig>>;
	postExperimentConfig: (config: ExperimentConfig) => Promise<Maybe<ExperimentConfig>>;
	getExperimentConfigHistory: () => Promise<Maybe<ExperimentConfig[]>>;
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

	const decorate: VerbDecorator = verb => async <T>(url: string, data: unknown, h: Record<string, string>): Promise<Maybe<T>> => {
		const result = await verb<T>(url, data, h);

		if (isMaybe(result)) {
			if (result.kind === 'Failure') {
				if (result.code === 'NOT_AUTHENTICATED') {
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
			return sessionStorage.getItem('wasLoggedIn') === 'true';
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

		async getParticipants(page: number, emailLike: string, pageSize = 15) {
			return get<Page<Participant>>(
				`${getParticipants}/${page}?pageSize=${pageSize}&emailLike=${encodeURIComponent(emailLike)}`,
				{},
				headers(),
			);
		},

		async getParticipantOverview(participantEmail: string) {
			return get<ParticipantOverview>(`${getParticipantOverview}/${participantEmail}`, {}, headers());
		},

		async getEvents(page = 0, pageSize = 15) {
			return get<Page<Event>>(`${getEvents}/${page}?pageSize=${pageSize}`, {}, headers());
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
	};
};

export default AdminApi;

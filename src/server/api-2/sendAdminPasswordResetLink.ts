import {type RouteDefinition} from '../lib/routeCreation';

export const sendAdminPasswordResetLink: RouteDefinition<void> = {
	verb: 'post',
	path: '/api/send-admin-password-reset-link',
	makeHandler: ({createLogger}) => async (req): Promise<void> => {
		const log = createLogger(req.requestId);

		log('info', 'received admin reset password request');

		const {email} = req.body as Record<string, string>;

		if (!email || typeof email !== 'string') {
			throw new Error('Email is required.');
		}

		log('info', 'the reset password request is for:', email);
	},
};

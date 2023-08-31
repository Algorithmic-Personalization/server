import Admin from '../../common/models/admin';
import ResetToken from '../models/resetPasswordToken';
import {type RouteDefinition} from '../lib/routeCreation';
import {randomToken} from '../lib/crypto';
import {sendResetLinkPath} from '../serverRoutes';

import {serverUrl} from '../lib/config-loader/serverUrl';

const ms24h = 1000 * 60 * 60 * 24;

export const sendAdminPasswordResetLink: RouteDefinition<void> = {
	verb: 'post',
	path: sendResetLinkPath,
	makeHandler: ({
		createLogger,
		dataSource,
		mailer,
	}) => async (req): Promise<void> => {
		const log = createLogger(req.requestId);

		log('info', 'received admin reset password request');

		const {email} = req.body as Record<string, string>;

		if (!email || typeof email !== 'string') {
			throw new Error('Email is required.');
		}

		const adminRepo = dataSource.getRepository(Admin);

		const admin = await adminRepo.findOneBy({email});

		if (!admin) {
			return;
		}

		if (!admin.emailVerified) {
			return;
		}

		const token = new ResetToken();
		token.adminId = admin.id;
		token.token = randomToken(64);
		token.usedAt = undefined;
		token.validUntil = new Date(Date.now() + ms24h);

		const resetTokenRepo = dataSource.getRepository(ResetToken);
		await resetTokenRepo.save(token);

		const subject = `Reset your password for: ${new URL(serverUrl).hostname}`;

		const text = `Please click on the following link to reset your password: ${
			serverUrl
		}/reset-password?token=${token.token} - it will expire in 24 hours.`;

		const html = `Please click on the following link to reset your password: <a href="${
			serverUrl
		}/reset-password?token=${token.token}">${
			serverUrl
		}/reset-password?token=${token.token}</a><br><br>It will expire in 24 hours.`;

		await mailer({
			to: email,
			subject,
			text,
			html,
		});

		log('success', 'reset password info sent:', {email, subject, text});
	},
};

export default sendAdminPasswordResetLink;

import Admin from '../../common/models/admin';
import ResetToken from '../models/resetPasswordToken';
import {type RouteDefinition} from '../lib/routeCreation';
import {randomToken} from '../lib/crypto';
import {sendResetLinkPath} from '../serverRoutes';

import {serverUrl} from '../lib/config-loader/serverUrl';
import {t} from '../lib/htmlGen';

const ms24h = 1000 * 60 * 60 * 24;
const tokenValidityMs = ms24h;

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
		token.validUntil = new Date(Date.now() + tokenValidityMs);

		const resetTokenRepo = dataSource.getRepository(ResetToken);
		await resetTokenRepo.save(token);

		const subject = `Reset your password for: ${new URL(serverUrl).hostname}`;

		const url = `${serverUrl}/reset-password/${token.token}`;

		const text = `Please visit (copy paste in browser URL bar) the following link to reset your password: \n\n${url}  \n\nIt will expire in 24 hours.`;

		const html = t('div')(
			t('p')('Please click on', t('a', {href: url})('this link'), 'to set a new password.'),
			t('p')(`The link will expire in ${Math.floor(tokenValidityMs / 1000 / 60 / 60)} hours.`),
		);

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

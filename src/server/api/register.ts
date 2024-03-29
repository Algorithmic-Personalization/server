import {type RouteCreator} from '../lib/routeCreation';

import Admin from '../../common/models/admin';
import {validateExcept, type Maybe, getMessage} from '../../common/util';

import {getVerifyEmailToken} from '../serverRoutes';
import {randomToken, hashPassword} from '../lib/crypto';

import whitelist from '../../../adminsWhitelist';

import {serverUrl} from '../lib/config-loader/serverUrl';

export const createRegisterRoute: RouteCreator = ({dataSource, mailer, createLogger}) => async (req, res) => {
	const log = createLogger(req.requestId);

	const admin = new Admin();
	Object.assign(admin, req.body);
	admin.createdAt = new Date();
	admin.updatedAt = new Date();
	admin.password = await hashPassword(admin.password);
	log('Received admin for registration (password is hashed):', admin);

	const errors = await validateExcept('id', 'verificationToken')(admin);

	if (errors.length > 0) {
		const err: Maybe<Admin> = {
			kind: 'Failure',
			message: `Invalid entity received from client: ${errors.join(', ')}`,
		};

		res.status(400).json(err);
		return;
	}

	if (!whitelist.has(admin.email)) {
		const err: Maybe<Admin> = {
			kind: 'Failure',
			message: 'Email not whitelisted',
		};

		res.status(403).json(err);
		return;
	}

	const repo = dataSource.getRepository(Admin);

	const existing = await repo.findOneBy({email: admin.email});

	if (existing) {
		res.status(400).json({
			kind: 'Failure',
			message: 'Email already registered',
		});
		return;
	}

	const token = randomToken();
	admin.verificationToken = token;

	try {
		await repo.save(admin);
	} catch (e) {
		res.status(500).json({
			kind: 'Failure',
			message: getMessage(e, 'Unknown database error'),
		});
		return;
	}

	const link = `${serverUrl}${getVerifyEmailToken}?token=${token}`;

	try {
		const ok = await mailer({
			to: admin.email,
			subject: 'Please verify your email address for YTDNPL admin',
			text: `Please paste the following link in your browser to verify your email address: ${link}`,
			html: `Please click <a href="${link}">here</a> to verify your email address.`,
		});

		if (ok) {
			log('success', 'e-mail sent', 'subject, subject');
		}

		res.status(200).json({
			kind: 'Success',
			value: 'Admin registered, please validate your account by clicking the link in the email you should receive shortly. Please check your spam folder if you don\'t see it in your inbox.',
		});
	} catch (e) {
		res.status(500).json({
			kind: 'Failure',
			message: getMessage(e, 'Unknown mailer error'),
		});
	}
};

export default createRegisterRoute;

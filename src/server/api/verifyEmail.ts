import {encode} from 'urlencode';

import {type RouteCreator} from '../lib/routeContext';

import Admin from '../../common/models/admin';

export const createVerifyEmailRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);
	const {token} = req.query;

	if (!token || typeof token !== 'string') {
		res.status(400).send('Missing token');
		return;
	}

	log('Received verify email verification token:', token);

	const adminRepo = dataSource.getRepository(Admin);

	const admin = await adminRepo.findOneBy({verificationToken: token});

	if (!admin) {
		res.status(404).send('User not found');
		return;
	}

	admin.updatedAt = new Date();
	admin.emailVerified = true;

	try {
		await adminRepo.save(admin);
	} catch (err) {
		log('Failed to save admin:', err);
		res.status(500).send('Failed to save admin');
		return;
	}

	res.redirect(`/login?message=${encode('Email verified, please log in!')}`);
};

export default createVerifyEmailRoute;

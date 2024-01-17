import Admin from '../../common/models/admin';
import ResetToken from '../models/resetPasswordToken';
import {type RouteDefinition} from '../lib/routeCreation';
import {hashPassword} from '../lib/crypto';
import {resetPasswordPath} from '../serverRoutes';

export const resetPassword: RouteDefinition<boolean> = {
	verb: 'post',
	path: resetPasswordPath,
	makeHandler: ({
		createLogger,
		dataSource,
	}) => async (req): Promise<boolean> => {
		const log = createLogger(req.requestId);

		log('info', 'received admin password update request');

		const {email, password, token: tokenString} = req.body as Record<string, string>;

		if (!email || typeof email !== 'string') {
			log('error', 'missing e-mail');
			return false;
		}

		if (!password || typeof password !== 'string') {
			log('error', 'missing password');
			return false;
		}

		if (!tokenString || typeof tokenString !== 'string') {
			log('error', 'missing token');
			return false;
		}

		const adminRepo = dataSource.getRepository(Admin);

		const admin = await adminRepo.findOneBy({email});

		if (!admin) {
			log('error', 'could not find admin by', {email});
			return false;
		}

		const resetTokenRepo = dataSource.getRepository(ResetToken);
		const token = await resetTokenRepo.findOneBy({token: tokenString});

		if (!token) {
			log('error', 'token not found');
			return false;
		}

		if (token.adminId !== admin.id) {
			log('error', 'token is not assigned to this admin', {tokenAdmin: token.adminId, emailAdmin: admin.id});
			return false;
		}

		if (token.validUntil < new Date()) {
			log('error', 'token is expired');
			return false;
		}

		if (token.usedAt) {
			log('error', 'token is already used');
			return false;
		}

		token.usedAt = new Date();

		admin.password = await hashPassword(password);

		await dataSource.transaction(async trx =>
			Promise.all([
				trx.save(admin),
				trx.save(token),
			]),
		);

		log('success', 'password updated successfully for', {email});
		return true;
	},
};

export default resetPassword;

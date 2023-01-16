import {ValidateNested} from 'class-validator';

import {type RouteCreator} from '../lib/routeContext';

import Admin from '../../common/models/admin';
import Token from '../models/token';

import {checkPassword} from '../lib/crypto';

export class LoginResponse {
	// eslint-disable-next-line @typescript-eslint/parameter-properties
	@ValidateNested()
		admin: Admin;

	// eslint-disable-next-line @typescript-eslint/parameter-properties
	@ValidateNested()
		token: Token;

	constructor(admin: Admin, token: Token) {
		this.admin = admin;
		this.token = token;
	}
}

export const createLoginRoute: RouteCreator = ({createLogger, dataSource, tokenTools}) => async (req, res) => {
	const log = createLogger(req.requestId);
	log('Received login request:', req.body.email);

	const {email, password} = req.body as {email: string; password: string};

	if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
		res.status(400).json({kind: 'Failure', message: 'Missing or invalid email or password'});
		return;
	}

	const adminRepo = dataSource.getRepository(Admin);

	const admin = await adminRepo.findOneBy({
		email,
	});

	if (!admin) {
		res.status(401).json({kind: 'Failure', message: 'Invalid email or password'});
		return;
	}

	if (!(await checkPassword(password, admin.password))) {
		res.status(401).json({kind: 'Failure', message: 'Invalid email or password'});
		return;
	}

	const token = new Token();
	token.token = tokenTools.sign('1h', admin.id);
	token.adminId = admin.id;

	const tokenRepo = dataSource.getRepository(Token);

	try {
		await tokenRepo.save(token);
	} catch (err) {
		log('Failed to save token:', err);
		res.status(500).json({kind: 'Failure', message: 'Failed to save token'});
		return;
	}

	res.json({
		kind: 'Success',
		value: new LoginResponse(admin, token),
	});
};

export default createLoginRoute;

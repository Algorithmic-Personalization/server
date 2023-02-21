import {type RouteCreator} from '../lib/routeCreation';
import Admin from '../../common/models/admin';

export const createAuthTestRoute: RouteCreator = ({createLogger, dataSource}) => async (req, res) => {
	const log = createLogger(req.requestId);

	log('Received auth test request');

	const adminRepo = dataSource.getRepository(Admin);

	if (req.adminId === undefined) {
		res.status(401).json({kind: 'Failure', message: 'Not authenticated'});
		return;
	}

	try {
		const admin = await adminRepo.findOneBy({id: req.adminId});
		if (!admin) {
			log('Admin not found:', req.adminId);
			res.status(401).json({kind: 'Failure', message: 'Not authenticated'});
			return;
		}

		log('Fetched admin:', admin?.email);
		res.json({kind: 'Success', value: admin});
	} catch (err) {
		log('Failed to fetch admin:', err);
		res.status(500).json({kind: 'Failure', message: 'Failed to fetch admin'});
	}
};

export default createAuthTestRoute;

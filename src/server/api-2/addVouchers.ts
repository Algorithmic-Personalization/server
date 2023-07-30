import {type RouteDefinition} from '../lib/routeCreation';

import Voucher from '../models/voucher';

const addVouchersDefinition: RouteDefinition<Voucher[]> = {
	verb: 'post',
	path: '/api/voucher',
	makeHandler: ({createLogger, dataSource}) => async (req): Promise<Voucher[]> => {
		const log = createLogger(req.requestId);
		log('info', 'Received add vouchers request');

		const vouchers = req.body as string[];

		if (!Array.isArray(vouchers)) {
			throw new Error('Invalid vouchers record, please post a JSON array of voucher codes');
		}

		const entities: Voucher[] = [];

		for (const code of vouchers) {
			if (typeof code !== 'string' || code.length === 0) {
				throw new Error('Invalid voucher code, please post a JSON array of voucher codes');
			}

			const entity = new Voucher();
			entity.voucherCode = code;
			entities.push(entity);
		}

		const voucherRepo = dataSource.getRepository(Voucher);

		const saved = await voucherRepo.save(entities);

		return saved;
	},
};

export default addVouchersDefinition;

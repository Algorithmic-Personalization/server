import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import {randomToken} from '../server/lib/crypto';
import Voucher from '../server/models/voucher';
import {createVoucherService} from '../server/lib/voucherService';

describe('getVoucher', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	const createVouchers = async (count: number) => {
		const vouchers: Voucher[] = [];

		for (let i = 0; i < count; ++i) {
			const voucher = new Voucher();
			voucher.voucherCode = randomToken(32);
			vouchers.push(voucher);
		}

		const repo = db.dataSource.getRepository(Voucher);

		await repo.save(vouchers);
	};

	it('should return a voucher for one participant', async () => {
		const participant = await db.createParticipant();
		await createVouchers(1);

		const vouchers = createVoucherService({
			dataSource: db.dataSource,
			log: jest.fn(),
		});

		const voucher = await vouchers.getAndMarkOneAsUsed(participant.id);

		expect(voucher).toBeDefined();
	});

	it('should fail to return a voucher for one participant if there are no vouchers', async () => {
		const vouchers = createVoucherService({
			dataSource: db.dataSource,
			log: jest.fn(),
		});

		const vouchersLeft = await vouchers.countAvailable();

		expect(vouchersLeft).toBe(0);

		const participant = await db.createParticipant();

		const voucher = await vouchers.getAndMarkOneAsUsed(participant.id);

		expect(voucher).toBeUndefined();
	});
});

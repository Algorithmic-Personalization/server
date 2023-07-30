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

	type VoucherRequestParallelTest = {
		nParticipants: number;
		nVouchers: number;
		nRequestsPerParticipant: number;
	};

	const voucherRequestParallelTests: VoucherRequestParallelTest[] = [
		{
			nParticipants: 2,
			nVouchers: 2,
			nRequestsPerParticipant: 1,
		},
		{
			nParticipants: 2,
			nVouchers: 2,
			nRequestsPerParticipant: 2,
		},
		{
			nParticipants: 2,
			nVouchers: 2,
			nRequestsPerParticipant: 10,
		},
		{
			nParticipants: 3,
			nVouchers: 2,
			nRequestsPerParticipant: 5,
		},
	];

	test.each(voucherRequestParallelTests)(
		'should not deliver too many vouchers even concurrently ($nParticipants participants, $nVouchers vouchers, $nRequestsPerParticipant requests per participant)',
		async scenario => {
			const {
				nParticipants,
				nVouchers,
				nRequestsPerParticipant,
			} = scenario;

			const vouchers = createVoucherService({
				dataSource: db.dataSource,
				log: jest.fn(),
			});

			expect(await vouchers.countAvailable()).toBe(0);

			await createVouchers(nVouchers);

			const participants = await Promise.all(
				Array.from({length: nParticipants}).map(async () => db.createParticipant()),
			);

			const voucherRequests: Array<Promise<void>> = [];
			const vouchersObtained = new Map<number, number>();

			participants.forEach(
				participant => {
					for (let i = 0; i < nRequestsPerParticipant; ++i) {
						const req = vouchers.getAndMarkOneAsUsed(participant.id);

						const check = req.then(v => {
							if (v) {
								const n = vouchersObtained.get(participant.id) ?? 0;
								vouchersObtained.set(participant.id, n + 1);
							}
						});

						voucherRequests.push(check);
					}
				},
			);

			await Promise.all(voucherRequests);

			const vouchersReceived = [...vouchersObtained.values()].reduce(
				(acc, n) => acc + n,
				0,
			);

			if (nVouchers < nParticipants) {
				for (const [, nObtained] of vouchersObtained) {
					expect(nObtained).toBeLessThanOrEqual(1);
				}
			} else {
				for (const [, nObtained] of vouchersObtained) {
					expect(nObtained).toBe(1);
				}
			}

			expect(vouchersReceived).toBe(Math.min(nParticipants, nVouchers));
		},
		10000,
	);
});

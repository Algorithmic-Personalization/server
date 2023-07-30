/* eslint-disable @typescript-eslint/consistent-type-imports */
import {DataSource, IsNull} from 'typeorm';

import {LogFunction} from './logger';
import Voucher from '../models/voucher';

export type VoucherServiceDependencies = {
	log: LogFunction;
	dataSource: DataSource;
};

export const createVoucherService = ({log, dataSource}: VoucherServiceDependencies) => ({
	async getAndMarkOneAsUsed(participantId: number): Promise<Voucher | undefined> {
		log('info', 'attempting to get voucher for participant', {participantId});

		const qr = dataSource.createQueryRunner();

		try {
			await qr.startTransaction();
			const repo = qr.manager.getRepository(Voucher);

			const voucher = await repo
				.createQueryBuilder('voucher')
				.useTransaction(true)
				.setLock('pessimistic_write')
				.where({participantId: IsNull()})
				.getOne();

			if (voucher) {
				voucher.participantId = participantId;
				voucher.deliveredAt = new Date();
				voucher.updatedAt = voucher.deliveredAt;
				const saved = await repo.save(voucher);

				await qr.commitTransaction();
				return saved;
			}

			return undefined;
		} catch (e) {
			log('error', 'error getting voucher', e);
			await qr.rollbackTransaction();
			return undefined;
		} finally {
			await qr.release();
		}
	},

	async countAvailable(): Promise<number> {
		const repo = dataSource.getRepository(Voucher);

		const vouchersLeft = await repo.count({
			where: {
				participantId: IsNull(),
			},
		});

		return vouchersLeft;
	},
});

export default createVoucherService;

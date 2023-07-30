/* eslint-disable @typescript-eslint/consistent-type-imports */
import {DataSource, IsNull} from 'typeorm';

import {LogFunction} from './logger';
import Voucher from '../models/voucher';

export type GetVoucherDependencies = {
	log: LogFunction;
	dataSource: DataSource;
};

export const createGetVoucher = ({log, dataSource}: GetVoucherDependencies) =>
	async (participantId: number): Promise<Voucher | undefined> => {
		log('info', 'attempting to get voucher for participant', {participantId});

		const repo = dataSource.getRepository(Voucher);

		const voucher = await repo.findOne({
			where: {
				participantId: IsNull(),
				deliveredAt: IsNull(),
			},
		});

		if (voucher) {
			voucher.participantId = participantId;
			voucher.deliveredAt = new Date();
			const saved = await repo.save(voucher);

			return saved;
		}

		return undefined;
	};

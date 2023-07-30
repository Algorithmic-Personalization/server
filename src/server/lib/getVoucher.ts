/* eslint-disable @typescript-eslint/consistent-type-imports */
import {DataSource} from 'typeorm';

import {LogFunction} from './logger';
import Voucher from '../models/voucher';

export type GetVoucherDependencies = {
	log: LogFunction;
	dataSource: DataSource;
};

export const createGetVoucher = ({log}: GetVoucherDependencies) =>
	async (participantId: number): Promise<Voucher | undefined> => {
		log('info', 'attempting to get voucher for participant', {participantId});
		return undefined;
	};

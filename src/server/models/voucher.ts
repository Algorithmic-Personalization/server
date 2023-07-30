/* eslint-disable @typescript-eslint/no-inferrable-types */

import {
	Column,
	Entity,
} from 'typeorm';

import {
	IsInt,
	Min,
	IsString,
	IsNotEmpty,
	IsDate,
} from 'class-validator';

import Model from '../../common/lib/model';

/* Unused vouchers have either no participantId */
/* nor deliveredAt, or both */

@Entity()
export class Voucher extends Model {
	@Column()
	@IsInt()
	@Min(0)
		participantId?: number;

	@Column()
	@IsString()
	@IsNotEmpty()
		voucherCode: string = '';

	@Column()
	@IsDate()
		deliveredAt?: Date;
}

export default Voucher;

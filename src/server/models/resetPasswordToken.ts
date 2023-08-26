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
export class ResetPasswordToken extends Model {
	@Column()
	@IsInt()
	@Min(0)
		participantId?: number;

	@Column()
	@IsString()
	@IsNotEmpty()
		token: string = '';

	@Column()
	@IsDate()
		usedAt?: Date;

	@Column()
	@IsDate()
		validUntil: Date = new Date(Date.now() + (1000 * 60 * 60 * 24));
}

export default ResetPasswordToken;

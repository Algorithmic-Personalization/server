/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsNotEmpty, IsBoolean, IsString, IsInt, IsPositive} from 'class-validator';

import Model from '../../common/lib/model';

@Entity()
export class Token extends Model {
	@IsNotEmpty()
	@Column()
	@IsString()
		token: string = '';

	@Column()
	@IsInt()
	@IsPositive()
		adminId: number = 0;

	@Column()
	@IsBoolean()
		wasInvalidated: boolean = false;

	@Column()
		name?: string;

	@Column()
	@IsBoolean()
		api: boolean = false;
}

export default Token;

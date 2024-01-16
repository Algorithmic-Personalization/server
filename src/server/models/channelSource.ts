/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsString, IsBoolean, IsOptional} from 'class-validator';

import Model from '../../common/lib/model';

@Entity()
export class ChannelSource extends Model {
	@Column()
	@IsString()
	@IsOptional()
		title?: string;

	@Column()
	@IsBoolean()
		isDefault: boolean = false;
}

export default ChannelSource;

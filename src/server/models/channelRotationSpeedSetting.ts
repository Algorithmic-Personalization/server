/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsBoolean, IsNumber} from 'class-validator';

import Model from '../../common/lib/model';

@Entity()
export class ChannelRotationSpeedSetting extends Model {
	@Column()
	@IsNumber()
		speedHours: number = 24;

	@Column()
	@IsBoolean()
		isCurrent: boolean = false;
}

export default ChannelRotationSpeedSetting;

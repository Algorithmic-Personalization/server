/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsString} from 'class-validator';

import Model from '../../common/lib/model';

@Entity()
export class UnusableChannel extends Model {
	@Column()
	@IsString()
		youtubeChannelId: string = '';
}

export default UnusableChannel;

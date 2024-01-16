/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsString, IsNotEmpty, IsInt} from 'class-validator';

import Model from '../../common/lib/model';

@Entity()
export class ChannelSourceItem extends Model {
	@Column()
	@IsInt()
		channelSourceId: number = 0;

	@Column()
	@IsNotEmpty()
	@IsInt()
		position: number = 0;

	@Column()
	@IsNotEmpty()
	@IsString()
		youtubeChannelId: string = '';
}

export default ChannelSourceItem;

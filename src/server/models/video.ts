/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Entity, Column} from 'typeorm';
import {IsString, IsNotEmpty} from 'class-validator';

import Model from '../lib/model';

@Entity()
export class Video extends Model {
	@Column()
	@IsString()
	@IsNotEmpty()
		title: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		url: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeId: string = '';
}

export default Video;

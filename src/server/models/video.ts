/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Entity, Column} from 'typeorm';
import {IsString, IsNotEmpty, IsOptional} from 'class-validator';

import Model from '../../common/lib/model';

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

	@Column()
	@IsString()
	@IsOptional()
		metadataAvailable?: boolean;
}

export default Video;

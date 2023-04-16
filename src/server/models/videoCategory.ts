/* eslint-disable @typescript-eslint/no-inferrable-types */
/**
 * SQL:
 * create table VideoCategory (
		youtube_id text not null primary key,
		title text not null,
	 );

 */

import {IsString, IsNotEmpty} from 'class-validator';
import {Entity, Column} from 'typeorm';
import Model from '../../common/lib/model';

@Entity()
class VideoCategory extends Model {
	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeId: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		title: string = '';
}

export default VideoCategory;

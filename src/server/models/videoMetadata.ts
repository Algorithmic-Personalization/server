/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity} from 'typeorm';

import Model from '../../common/lib/model';
import {IsString, IsNotEmpty, IsEnum} from 'class-validator';

export enum MetadataType {
	TAG = 'TAG',
	TOPIC_CATEGORY = 'TOPIC_CATEGORY',
	YT_CATEGORY_ID = 'YT_CATEGORY_ID',
	YT_CATEGORY_TITLE = 'YT_CATEGORY_TITLE',
	VIEW_COUNT = 'VIEW_COUNT',
	LIKE_COUNT = 'LIKE_COUNT',
	COMMENT_COUNT = 'COMMENT_COUNT',
	TITLE = 'TITLE',
	DESCRIPTION = 'DESCRIPTION',
	PUBLISHED_AT = 'PUBLISHED_AT',
	YT_CHANNEL_ID = 'YT_CHANNEL_ID',
}

@Entity()
class VideoMetadata extends Model {
	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeId: string = '';

	@Column()
	@IsEnum(MetadataType)
	@IsNotEmpty()
		type: MetadataType = MetadataType.TAG;

	@Column('simple-json')
	@IsNotEmpty()
		value: string | number | Date = '';
}

export default VideoMetadata;

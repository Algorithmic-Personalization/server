/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity} from 'typeorm';

import Model from '../../common/lib/model';
import {IsString, IsNotEmpty, IsDate, Min, IsInt, MinDate} from 'class-validator';

@Entity()
class VideoMetadata extends Model {
	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeId: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeCategoryId: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		categoryTitle: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		youtubeChannelId: string = '';

	@Column()
	@IsString()
	@IsNotEmpty()
		videoTitle: string = '';

	@Column()
	@IsString()
		videoDescription: string = '';

	@Column()
	@IsDate()
	@IsNotEmpty()
	@MinDate(new Date(1))
		publishedAt: Date = new Date(0);

	@Column()
	@IsInt()
	@Min(0)
		viewCount: number = -1;

	@Column()
	@IsInt()
	@Min(0)
		likeCount: number = -1;

	@Column()
	@IsInt()
	@Min(0)
		commentCount: number = -1;

	@Column('text', {array: true})
	@IsString({each: true})
		tags: string[] = [];

	@Column('text', {array: true})
	@IsString({each: true})
		topicCategories: string[] = [];
}

export default VideoMetadata;

/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Entity, Column} from 'typeorm';
import {IsInt} from 'class-validator';

import Model from '../../common/lib/model';

export enum ListType {
	PERSONALIZED = 'PERSONALIZED',
	NON_PERSONALIZED = 'NON_PERSONALIZED',
	SHOWN = 'SHOWN',
	HOME_DEFAULT = 'HOME_DEFAULT',
	HOME_REPLACEMENT_SOURCE = 'HOME_REPLACEMENT_SOURCE',
	HOME_SHOWN = 'HOME_SHOWN',
}

export enum VideoType {
	PERSONALIZED = 'PERSONALIZED',
	NON_PERSONALIZED = 'NON_PERSONALIZED',
	MIXED = 'MIXED',
}

@Entity()
export class VideoListItem extends Model {
	@Column()
	@IsInt()
		eventId: number = 0;

	@Column()
	@IsInt()
		videoId: number = 0;

	@Column()
	@IsInt()
		position: number = 0;

	@Column()
		listType: ListType = ListType.SHOWN;

	@Column()
		videoType: VideoType = VideoType.MIXED;
}

export default VideoListItem;

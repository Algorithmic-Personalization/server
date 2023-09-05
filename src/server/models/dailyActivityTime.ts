/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity, ManyToOne, JoinColumn} from 'typeorm';
import {IsInt, IsNumber, Min} from 'class-validator';

import Model from '../../common/lib/model';
import Participant from './participant';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ActivityMetrics {
	pagesViewed: number;
	videoPagesViewed: number;
	videoTimeViewedSeconds: number;
	timeSpentOnYoutubeSeconds: number;
	sidebarRecommendationsClicked: number;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface DailyMetrics extends ActivityMetrics {
	day: Date;
	nParticipants: number;
}

@Entity()
export class DailyActivityTime extends Model implements ActivityMetrics {
	@Column()
		participantId: number = 0;

	@Column()
	@IsInt()
	@Min(0)
		pagesViewed: number = 0;

	@Column()
	@IsInt()
	@Min(0)
		videoPagesViewed: number = 0;

	@Column()
	@IsNumber()
	@Min(0)
		videoTimeViewedSeconds: number = 0;

	@Column()
	@IsNumber()
	@Min(0)
		timeSpentOnYoutubeSeconds: number = 0;

	@Column()
	@IsInt()
	@Min(0)
		sidebarRecommendationsClicked: number = 0;

	@ManyToOne(() => Participant)
	@JoinColumn({name: 'participant_id'})
		participant?: Participant;
}

export default DailyActivityTime;

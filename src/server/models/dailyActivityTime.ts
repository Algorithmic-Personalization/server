/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity} from 'typeorm';

@Entity()
export class DailyActivityTime {
	@Column()
		participantId: number = 0;

	@Column()
		date: Date = new Date();

	@Column()
		pagesViewed: number = 0;

	@Column()
		videoPagesViewed: number = 0;

	@Column()
		videoTimeViewedSeconds: number = 0;

	@Column()
		timeSpentOnYoutubeSeconds: number = 0;
}

export default DailyActivityTime;

/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity} from 'typeorm';
import Model from '../../common/lib/model';

@Entity()
export class DailyActivityTime extends Model {
	@Column()
		participantId: number = 0;

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

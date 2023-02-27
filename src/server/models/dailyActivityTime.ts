/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity, ManyToOne, JoinColumn} from 'typeorm';
import Model from '../../common/lib/model';
import Participant from './participant';

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

	@ManyToOne(() => Participant)
	@JoinColumn({name: 'participant_id'})
		participant?: Participant;
}

export default DailyActivityTime;

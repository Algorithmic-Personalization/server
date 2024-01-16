/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column, OneToMany} from 'typeorm';
import {IsNotEmpty, IsString, IsInt, Min, Max, IsBoolean, IsDate} from 'class-validator';

import Model from '../../common/lib/model';
import {ExperimentArm} from '../../common/models/event';
import DailyActivityTime from './dailyActivityTime';

@Entity()
export class Participant extends Model {
	@IsNotEmpty()
	@Column()
	@IsString()
		code: string = '';

	@Column()
	@IsInt()
	@IsNotEmpty()
	@Min(0)
	@Max(2)
		phase: number = 0;

	@Column()
		arm: ExperimentArm = ExperimentArm.TREATMENT;

	@OneToMany(() => DailyActivityTime, activityTime => activityTime.participant)
		activityTimes?: DailyActivityTime[];

	@Column()
	@IsBoolean()
		extensionInstalled: boolean = false;

	@Column()
		extensionActivatedAt?: Date;

	@Column()
	@IsBoolean()
		isPaid: boolean = false;

	@Column()
	@IsInt()
		channelSourceId?: number;

	@Column()
	@IsInt()
		posInChannelSource: number = 0;

	@Column()
	@IsDate()
		posInChannelSourceLastUpdatedAt: Date = new Date();
}

export const isValidPhase = (phase: unknown): phase is number =>
	typeof phase === 'number' && phase >= 0 && phase <= 2;

export default Participant;

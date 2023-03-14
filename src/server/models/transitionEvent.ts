/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsInt, Min, Max} from 'class-validator';

import DailyActivityTime from './dailyActivityTime';

export enum TransitionReason {
	AUTOMATIC = 'AUTOMATIC',
	FORCED = 'FORCED',
}

@Entity()
export class TransitionEvent extends DailyActivityTime {
	@Column()
	@IsInt()
		eventId?: number;

	@Column()
	@IsInt()
		transitionSettingId?: number;

	@Column()
		reason: TransitionReason = TransitionReason.AUTOMATIC;

	@Column()
	@IsInt()
	@Min(0)
	@Max(2)
		fromPhase: number = 0;

	@Column()
	@IsInt()
	@Min(0)
	@Max(2)
		toPhase: number = 0;

	@Column()
	@IsInt()
		sidebarRecommendationsClicked: number = 0;

	@Column()
	@IsInt()
		numDays: number = 0;
}

export default TransitionEvent;

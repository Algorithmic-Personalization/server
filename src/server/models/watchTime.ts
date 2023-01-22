/* eslint-disable @typescript-eslint/no-inferrable-types */

import {IsInt, IsNumber, IsPositive} from 'class-validator';
import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class WatchTime {
	@IsInt()
	@IsPositive()
	@PrimaryColumn()
		eventId: number = 0;

	@IsNumber()
	@IsPositive()
	@Column()
		secondsWatched: number = 0;
}

export default WatchTime;

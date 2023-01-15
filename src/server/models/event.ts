/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsInt, IsNotEmpty, IsString, IsPositive} from 'class-validator';

import Model from '../lib/model';
import {uuidv4} from '../../common/util';

export enum EventType {
	PAGE_VIEW = 'PAGE_VIEW',
	RECOMMENDATIONS_SHOWN = 'RECOMMENDATIONS_SHOWN',
	PERSONALIZED_CLICKED = 'PERSONALIZED_CLICKED',
	NON_PERSONALIZED_CLICKED = 'NON_PERSONALIZED_CLICKED',
	MIXED_CLICKED = 'MIXED_CLICKED',
}

import {ExperimentArm} from '../../common/models/participant';

@Entity()
export class Event extends Model {
	@Column()
	@IsNotEmpty()
	@IsString()
		sessionUuid: string = '';

	@Column()
	@IsInt()
	@IsPositive()
		experimentConfigId: number = 0;

	@Column()
		arm: ExperimentArm = ExperimentArm.TREATMENT;

	@Column()
		type: EventType = EventType.PAGE_VIEW;

	@Column()
	@IsNotEmpty()
	@IsString()
		url: string = '';

	@Column()
	@IsNotEmpty()
	@IsString()
		localUuid: string = uuidv4();
}

export default Event;

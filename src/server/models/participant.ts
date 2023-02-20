/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column} from 'typeorm';
import {IsNotEmpty, IsString} from 'class-validator';

import Model from '../../common/lib/model';
import {ExperimentArm} from '../../common/models/event';

@Entity()
export class Participant extends Model {
	@IsNotEmpty()
	@Column()
	@IsString()
		email: string = '';

	@IsNotEmpty()
	@Column()
	@IsString()
		code: string = '';

	@Column()
		arm: ExperimentArm = ExperimentArm.TREATMENT;
}

export default Participant;

/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column, Generated} from 'typeorm';
import {IsNotEmpty, IsString} from 'class-validator';

import Model from '../lib/model';

@Entity()
export class Session extends Model {
	@Column()
	@Generated()
		uuid: string = '';

	@Column()
	@IsNotEmpty()
	@IsString()
		participantCode: string = '';
}

export default Session;

/* eslint-disable @typescript-eslint/no-inferrable-types */

import {Entity, Column, OneToMany} from 'typeorm';
import {IsNotEmpty, MinLength, IsString, Length} from 'class-validator';

import Model from '../lib/model';
import ExperimentConfig from '../../common/models/experimentConfig';

@Entity()
export class Admin extends Model {
	@IsNotEmpty()
	@Column()
	@IsString()
		name: string = '';

	@IsNotEmpty()
	@Column()
	@IsString()
		email: string = '';

	@IsNotEmpty()
	@MinLength(8)
	@Column()
	@IsString()
		password: string = '';

	@Column()
	@IsString()
	@Length(128, 128)
		verificationToken: string = '';

	@Column()
		emailVerified: boolean = false;

	@OneToMany(() => ExperimentConfig, experimentConfig => experimentConfig.admin)
		experimentConfigs?: ExperimentConfig[];
}

export default Admin;

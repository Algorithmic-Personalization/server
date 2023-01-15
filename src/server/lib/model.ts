import {Column, PrimaryGeneratedColumn} from 'typeorm';
import {IsDate, IsInt, IsPositive} from 'class-validator';
export class Model {
	@PrimaryGeneratedColumn()
	@IsInt()
	@IsPositive()
		id = 0;

	@Column()
	@IsDate()
		createdAt: Date = new Date();

	@Column()
	@IsDate()
		updatedAt: Date = new Date();
}
export default Model;

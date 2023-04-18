/* eslint-disable @typescript-eslint/no-inferrable-types */
import {Column, Entity} from 'typeorm';

import Model from '../../common/lib/model';
import {IsInt, IsNotEmpty, IsOptional, IsString, Min} from 'class-validator';

export enum HttpVerb {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
	PATCH = 'PATCH',
	HEAD = 'HEAD',
	OPTIONS = 'OPTIONS',
	CONNECT = 'CONNECT',
	TRACE = 'TRACE',
}

@Entity()
export class RequestLog extends Model {
	@Column()
	@Min(0)
	@IsNotEmpty()
		latencyMs: number = 0;

	@Column()
	@Min(0)
	@IsInt()
	@IsNotEmpty()
		requestId: number = 0;

	@Column()
	@IsString()
	@IsOptional()
		sessionUuid?: string;

	@Column()
	@IsString()
	@IsNotEmpty()
		verb: HttpVerb = HttpVerb.GET;

	@Column()
	@IsString()
	@IsNotEmpty()
		path: string = '';

	@Column()
	@IsInt()
	@IsNotEmpty()
		statusCode: number = 0;

	@Column('simple-json')
	@IsString({each: true})
	@IsNotEmpty()
		message: string[] = [];

	@Column('simple-json')
	@IsString({each: true})
	@IsNotEmpty()
		comment: string[] = [];
}

export default RequestLog;

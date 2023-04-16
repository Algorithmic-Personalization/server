/* eslint-disable @typescript-eslint/no-inferrable-types */

import {IsString, IsNotEmpty, Min} from 'class-validator';
import {Column, Entity} from 'typeorm';

import Model from '../../common/lib/model';

@Entity('youtube_request_latency')
class YouTubeRequestLatency extends Model {
	@Column()
	@IsString()
	@IsNotEmpty()
		request: string = '';

	@Column()
	@Min(0)
	@IsNotEmpty()
		latencyMs: number = 0;
}

export default YouTubeRequestLatency;

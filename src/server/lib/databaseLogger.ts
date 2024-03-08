import {AbstractLogger, type LogLevel, type LogMessage, type QueryRunner} from 'typeorm';
import {PlatformTools} from 'typeorm/platform/PlatformTools';
import type Meter from '@pm2/io/build/main/utils/metrics/meter';

import {inspect} from 'util';
import {type LogFunction} from './logger';

export class DatabaseLogger extends AbstractLogger implements AbstractLogger {
	constructor(private readonly logger: LogFunction, private readonly slowQueryMeter?: Meter) {
		super();
	}

	logQuerySlow(time: number, query: string, parameters?: any[] | undefined, _queryRunner?: QueryRunner | undefined): void {
		this.logger(
			'/!\\ Query is slow /!\\ time:',
			time,
			'query:',
			PlatformTools.highlightSql(query),
			'parameters:',
			parameters ? inspect(parameters) : '',
		);

		this.slowQueryMeter?.mark();
	}

	protected writeLog(level: LogLevel, message: string | number | LogMessage | Array<string | number | LogMessage>): void {
		this.logger(level, message);
	}
}

export default DatabaseLogger;

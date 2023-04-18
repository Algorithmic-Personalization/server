/* eslint-disable @typescript-eslint/no-inferrable-types */

import Model from '../../common/lib/model';

export class YtStats extends Model {
	metadataRequestTimeMs: number = 0;

	failRate: number = 0;

	dbHitRate: number = 0;

	cacheHitRate: number = 0;

	cacheMemSizeBytes: number = 0;

	cacheMemSizeString: string = '';

	cachedEntries: number = 0;

	hitRate: number = 0;

	overAllCacheHitRate: number = 0;
}

export default YtStats;

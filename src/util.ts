import {
	type SelectQueryBuilder,
	type ObjectLiteral,
	type InsertQueryBuilder,
} from 'typeorm';

import {type LogFunction} from './server/lib/logger';

export type LocalDateTime = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
};

export const localNow = (): LocalDateTime => {
	const now = new Date();

	return {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate(),
		hour: now.getHours(),
		minute: now.getMinutes(),
		second: now.getSeconds(),
	};
};

export const daysElapsed = (fromDate: Date, toDate: Date): number => {
	const from = new Date(fromDate);
	const to = new Date(toDate);
	from.setHours(0, 0, 0, 0);
	to.setHours(0, 0, 0, 0);
	return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatSize = (sizeInBytes: number): string => {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let unitIndex = 0;
	let size = sizeInBytes;

	while (size > 1024) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const formatPct = (pctBetween0And100: number): string =>
	`${pctBetween0And100.toFixed(2)}%`;

// Compute a percentage from 0 to 100 as a number, with two decimal places
export const pct = (numerator: number, denominator: number): number =>
	Number(Math.round(100 * numerator / denominator).toFixed(2));

export const asyncPerf = async <T>(f: () => Promise<T>, identifier?: string, customLog?: LogFunction): Promise<T> => {
	const tStart = Date.now();
	const log = customLog ?? console.log;

	const {heapTotal: heapTotalBefore, heapUsed: heapUsedBefore} = process.memoryUsage();

	let result: T;
	let threw = false;
	let error;
	try {
		result = await f();
	} catch (e) {
		threw = true;
		error = e;
		throw e;
	} finally {
		const tElapsed = Date.now() - tStart;

		const {heapTotal: heapTotalAfter, heapUsed: heapUsedAfter} = process.memoryUsage();

		const heapTotalDiff = heapTotalAfter - heapTotalBefore;
		const heapUsedDiff = heapUsedAfter - heapUsedBefore;

		log(`${identifier ?? 'unspecified function'} took ${tElapsed}ms to run`);
		if (threw) {
			log('error', 'the function threw an error:', error);
		}

		log(`heap: total before = ${formatSize(heapTotalBefore)}, total after = ${formatSize(heapTotalAfter)}, diff = ${formatSize(heapTotalDiff)}`);
		log(`heap: used before = ${formatSize(heapUsedBefore)}, used after = ${formatSize(heapUsedAfter)}, diff = ${formatSize(heapUsedDiff)}`);
	}

	return result;
};

export const stringFromMaybeError = (
	maybeError: unknown,
	defaultMessage = 'unknown error',
): string => {
	if (!maybeError) {
		return defaultMessage;
	}

	if (maybeError instanceof Error) {
		return [
			maybeError.name,
			maybeError.message,
			maybeError.stack,
		].join('\n');
	}

	return JSON.stringify(maybeError);
};

export const showSql = (log: LogFunction) => <T extends ObjectLiteral>(qb: SelectQueryBuilder<T>): SelectQueryBuilder<T> => {
	const sql = qb.getSql();
	log('info', 'running query:', sql);
	return qb;
};

export const showInsertSql = (log: LogFunction) => <T extends ObjectLiteral>(qb: InsertQueryBuilder<T>): InsertQueryBuilder<T> => {
	const sql = qb.getSql();
	log('info', 'running query:', sql);
	return qb;
};

export const sleep = async (ms: number): Promise<void> => new Promise(resolve => {
	setTimeout(resolve, ms);
});

import {basename, dirname, join} from 'path';

import {createWriteStream} from 'fs';
import {stat, readFile, writeFile, cp, rm} from 'fs/promises';
import {inspect} from 'util';

import {gzip} from 'node-gzip';
import AsyncLock from 'async-lock';

export type LogFunction = (message: string, ...args: any[]) => void;

export type CreateLogger = (requestIdOrId: number | string) => LogFunction;

const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const orange = (str: string) => `\x1b[33m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

const logSizeCheckInterval = 1000 * 60 * 60 * 24; // 24h
const compressAboveThresholdBytes = 1024 * 1024 * 32; // 32 MB

const getMonth = (d: Date) => {
	const m = d.getMonth() + 1;

	if (m < 10) {
		return `0${m}`;
	}

	return m.toString(10);
};

const lock = new AsyncLock();

export const makeCreateDefaultLogger = (filePath: string, useStdOut = true): CreateLogger => (requestIdOrId: number | string) => {
	let prettyStream = createWriteStream(filePath, {flags: 'a'});

	const doCheckLogSizeAndCompress = async () => {
		try {
			const s = await stat(filePath);

			if (s.size < compressAboveThresholdBytes) {
				return;
			}

			prettyStream.close();
			const tmpPath = `${filePath}.tmp`;
			await cp(filePath, tmpPath);
			prettyStream = createWriteStream(filePath, {flags: 'w'});

			const contents = await readFile(tmpPath);
			const compressed = await gzip(contents);
			const date = new Date();

			const y = date.getFullYear();
			const m = getMonth(date);
			const d = date.getDate();
			const h = date.getHours();
			const min = date.getMinutes();
			const secs = date.getSeconds();

			const rootName = basename(filePath, '.log');
			const dirName = dirname(filePath);
			const targetName = `${rootName}-${y}-${m}-${d} (${h}h${min}m${secs}s).log.gz`;
			const targetPath = join(dirName, targetName);

			writeFile(targetPath, compressed).catch(err => {
				console.error('Error writing log file', targetPath, err);
			});
			await rm(tmpPath);
		} catch (e) {
			if ((e as any).code !== 'ENOENT') {
				console.error('Something went wrong while checking the log size at:', filePath, e);
			}
		}
	};

	const checkLogSizeAndCompress = async () => lock.acquire('log', doCheckLogSizeAndCompress);

	setInterval(checkLogSizeAndCompress, logSizeCheckInterval);
	checkLogSizeAndCompress().catch(e => {
		console.error('Error checking log size and compressing', e);
	});

	return (...args: any[]) => {
		const id = typeof requestIdOrId === 'number' ? `request #${requestIdOrId}` : requestIdOrId;

		const parts = [`\x1b[94m[${id} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
			if (typeof arg === 'string' && i === 0) {
				const str = arg.toLowerCase();

				if (str === 'error' || str.startsWith('fail')) {
					return red(str);
				}

				if (str === 'warning') {
					return orange(str);
				}

				if (str === 'success') {
					return green(str);
				}

				if (str === 'info') {
					return blue(str);
				}

				return str;
			}

			if (typeof arg === 'string') {
				return arg;
			}

			return inspect(arg, {depth: null, colors: true});
		})];

		if (useStdOut) {
			console.log(...parts);
		}

		prettyStream.write(`${parts.join(' ')}\n`);
	};
};

export default makeCreateDefaultLogger;

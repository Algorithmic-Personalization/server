import {type WriteStream} from 'fs';
import {inspect} from 'util';

export type LogFunction = (message: string, ...args: any[]) => void;

export type CreateLogger = (requestIdOrId: number | string) => LogFunction;

const red = (str: string) => `\x1b[31m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;
const orange = (str: string) => `\x1b[33m${str}\x1b[0m`;
const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;

export const makeCreateDefaultLogger = (prettyStream: WriteStream): CreateLogger => (requestIdOrId: number | string) =>
	(...args: any[]) => {
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

		console.log(...parts);
		prettyStream.write(`${parts.join(' ')}\n`);
	};

export default makeCreateDefaultLogger;

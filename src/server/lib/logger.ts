import {type WriteStream} from 'fs';
import {inspect} from 'util';

export type LogFunction = (message: string, ...args: any[]) => void;

export type CreateLogger = (requestIdOrId: number | string) => LogFunction;

export const createDefaultLogger = (f: WriteStream): CreateLogger => (requestIdOrId: number | string) =>
	(...args: any[]) => {
		const id = typeof requestIdOrId === 'number' ? `request #${requestIdOrId}` : requestIdOrId;

		const parts = [`\x1b[94m[${id} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
			if (typeof arg === 'string' && i === 0) {
				return arg.toLowerCase();
			}

			if (typeof arg === 'string') {
				return arg;
			}

			return inspect(arg, {depth: null, colors: true});
		})];

		console.log(...parts);
		f.write(`${parts.join(' ')}\n`);
	};

export default createDefaultLogger;

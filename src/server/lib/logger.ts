import {type WriteStream} from 'fs';
import {inspect} from 'util';

export type LogFunction = (message: string, ...args: any[]) => void;

export type CreateLogger = (requestId: number) => LogFunction;

export const createDefaultLogger = (f: WriteStream): CreateLogger => (requestId: number) =>
	(...args: any[]) => {
		const parts = [`\x1b[94m[request #${requestId} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
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

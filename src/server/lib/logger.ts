import {type WriteStream} from 'fs';

export type LogFunction = (message: string, ...args: any[]) => void;

export type CreateLogger = (requestId: number) => LogFunction;

export const createDefaultLogger = (f: WriteStream): CreateLogger => (requestId: number) =>
	(...args: any[]) => {
		const parts = [`[request #${requestId} at ${new Date().toISOString()}]`, ...args.map(arg => {
			if (typeof arg === 'string') {
				return arg.toLowerCase();
			}

			return arg as unknown;
		})];

		console.log(...parts);
		f.write(`${parts.join(' ')}\n`);
	};

export default createDefaultLogger;

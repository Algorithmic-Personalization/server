type ErrorCallBack = (err: Error) => void;

declare module 'jsonparse' {
	class Parser {
		onValue: (value: any) => void;
		onError: (cb: ErrorCallBack) => void;
		write: (chunk: string) => void;
	}

	export = Parser;
}

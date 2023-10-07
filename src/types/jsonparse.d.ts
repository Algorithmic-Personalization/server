declare module 'jsonparse' {
	class Parser {
		onValue: (value: any) => void;

		write: (chunk: string) => void;
	}

	export = Parser;
}

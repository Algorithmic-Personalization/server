declare module 'JSONStream' {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/naming-convention
	interface JSONStream {
		parse(pattern: any): NodeJS.ReadWriteStream;

		parse(patterns: any[]): NodeJS.ReadWriteStream;

		/**
		* Create a writable stream.
		* You may pass in custom open, close, and seperator strings, but, by default,
		* JSONStream.stringify() will create an array,
		* (with default options open='[\n', sep='\n,\n', close='\n]\n')
		*/
		stringify(): NodeJS.ReadWriteStream;

		/**
		* Create a writable stream.
		* You may pass in custom open, close, and seperator strings.
		*/
		stringify(open: string, sep: string, close: string): NodeJS.ReadWriteStream;

		/** Creates a writable stream where elements are only seperated by a newline. */
		// eslint-disable-next-line @typescript-eslint/unified-signatures
		stringify(newlineOnly: NewlineOnlyIndicator): NodeJS.ReadWriteStream;

		stringifyObject(): NodeJS.ReadWriteStream;
		stringifyObject(open: string, sep: string, close: string): NodeJS.ReadWriteStream;
	}

	export type NewlineOnlyIndicator = false;

	const api: JSONStream;

	export default api;
}

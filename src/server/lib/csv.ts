import {parse as parseCsv} from 'csv-parse';

export const parse = async (csv: string): Promise<Array<Record<string, string>>> => new Promise((resolve, reject) => {
	const parser = parseCsv({columns: true});
	const records: Array<Record<string, string>> = [];

	parser.on('readable', () => {
		for (;;) {
			const record = parser.read() as Record<string, string> | undefined;

			if (!record) {
				break;
			}

			records.push(record);
		}
	});

	parser.on('error', reject);
	parser.on('end', () => {
		resolve(records);
	});

	parser.write(csv);
	parser.end();
});

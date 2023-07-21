import {type TestDb} from '../server/tests-util/resetTestDb';
import resetDb from '../server/tests-util/resetTestDb';

describe('activateExtension', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
		console.log('db', db);
	});

	it('is a dummy test', () => {
		expect(1 + 1).toBe(2);
	});
});

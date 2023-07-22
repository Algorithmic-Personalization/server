import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

describe('activateExtension', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	it('should activate the extension for a participant', async () => {
		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const event = await db.createEvent(session);
		console.log('event', event);
	});
});

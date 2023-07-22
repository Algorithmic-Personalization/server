import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import {createActivateExtension} from '../server/api/postEvent/createUpdateActivity';
import {type ParticipantActivityNotifier} from '../server/lib/externalNotifier';

const createMockParticipantActivityNotifier = (): ParticipantActivityNotifier => {
	const notifier: ParticipantActivityNotifier = {
		notifyActive: jest.fn(),
		notifyInstalled: jest.fn(),
		notifyPhaseChange: jest.fn(),
	};

	return notifier;
};

describe('activateExtension', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	it('should activate the extension for a participant', async () => {
		const activityNotifier = createMockParticipantActivityNotifier();

		const activateExtension = createActivateExtension({
			dataSource: db.dataSource,
			activityNotifier,
			log: jest.fn(),
		});

		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const event = await db.createEvent(session);

		await activateExtension(event, participant);

		expect(activityNotifier.notifyActive).toHaveBeenCalledTimes(1);
	});
});

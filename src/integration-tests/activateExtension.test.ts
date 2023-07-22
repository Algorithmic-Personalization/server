import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import {createActivateExtension} from '../server/api/postEvent/createActivateExtension';
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
		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const event = await db.createEvent(session);

		const activityNotifier = createMockParticipantActivityNotifier();

		const activateExtension = createActivateExtension({
			dataSource: db.dataSource,
			activityNotifier,
			log: jest.fn(),
		});

		await activateExtension(event, participant);

		expect(activityNotifier.notifyActive).toHaveBeenCalledTimes(1);
	});

	it('should activate the extension only once for a participant', async () => {
		const activityNotifier = createMockParticipantActivityNotifier();
		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const activateExtension = createActivateExtension({
			dataSource: db.dataSource,
			activityNotifier,
			log: jest.fn(),
		});

		const activationRequests: Array<Promise<void>> = [];

		for (let i = 0; i < 10; i++) {
			const activationPromise = db.createEvent(session).then(
				async event =>
					activateExtension(event, participant),
			);

			activationRequests.push(activationPromise);
		}

		await Promise.allSettled(activationRequests);

		expect(activityNotifier.notifyActive).toHaveBeenCalledTimes(1);
	});
});

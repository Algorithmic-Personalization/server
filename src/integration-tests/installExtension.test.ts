import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import createHandleExtensionInstalledEvent from '../server/api/postEvent/handleExtensionInstalledEvent';
import createMockParticipantActivityNotifier from '../server/tests-util/createMockParticipantActivityNotifier';

describe('installExtension', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	it('should notify the remote server of the installation', async () => {
		const notifier = createMockParticipantActivityNotifier();

		const handleInstallEvent = createHandleExtensionInstalledEvent({
			dataSource: db.dataSource,
			notifier,
			log: jest.fn(),
		});

		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const event = await db.createEvent(session);

		await handleInstallEvent(participant, event);

		expect(notifier.onInstalled).toHaveBeenCalledTimes(1);
	});

	it('should not notify the remote server of the installation if already installed', async () => {
		const notifier = createMockParticipantActivityNotifier();

		const handleInstallEvent = createHandleExtensionInstalledEvent({
			dataSource: db.dataSource,
			notifier,
			log: jest.fn(),
		});

		const participant = await db.createParticipant();
		const session = await db.createSession(participant);
		const event = await db.createEvent(session);

		await handleInstallEvent(participant, event);

		const installAttempts: Array<Promise<void>> = [];

		for (let i = 0; i < 15; ++i) {
			const installAttempt = handleInstallEvent(participant, event);
			installAttempts.push(installAttempt);
		}

		await Promise.allSettled(installAttempts);

		expect(notifier.onInstalled).toHaveBeenCalledTimes(1);
	}, 30000);
});

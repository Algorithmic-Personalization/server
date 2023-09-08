import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import {createSaveParticipantTransition} from '../server/lib/participant';
import {createMockParticipantActivityNotifier} from '../server/tests-util/createMockParticipantActivityNotifier';

describe('updateParticipantPhase', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	it('should make a participant transition phases', async () => {
		const notifier = createMockParticipantActivityNotifier();

		const saveTransition = createSaveParticipantTransition({
			dataSource: db.dataSource,
			notifier,
		});

		const participant = await db.createParticipant();

		const transition = await db.createTransitionEvent(participant);

		const updatedParticipant = await saveTransition(
			participant,
			transition,
			undefined,
		);

		expect(updatedParticipant.phase).toEqual(transition.toPhase);
		expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
	});
});

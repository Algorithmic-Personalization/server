import {type TestDb} from '../server/tests-util/db';
import resetDb from '../server/tests-util/db';

import {createSaveParticipantTransition} from '../server/lib/participant';
import {createMockParticipantActivityNotifier} from '../server/tests-util/createMockParticipantActivityNotifier';
import Participant from '../server/models/participant';
import {TransitionReason} from '../server/models/transitionEvent';

describe('updateParticipantPhase', () => {
	let db: TestDb;

	beforeAll(async () => {
		db = await resetDb();
		await db.createTransitionSettings();
	});

	afterAll(async () => {
		await db.tearDown();
	});

	it('should make a participant transition phases', async () => {
		const notifier = createMockParticipantActivityNotifier();

		const saveTransition = createSaveParticipantTransition({
			dataSource: db.dataSource,
			notifier,
			log: jest.fn(),
		});

		const participant = await db.createParticipant();

		const transition = db.createTransitionEvent(participant);

		await saveTransition(
			participant,
			transition,
			undefined,
		);

		expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);

		const updatedParticipant = await db.dataSource.getRepository(Participant).findOneOrFail({
			where: {
				id: participant.id,
			},
		});

		expect(updatedParticipant.phase).toBe(transition.toPhase);
	});

	it('should transition a user with an attached event', async () => {
		const participant = await db.createParticipant();

		const transition = db.createTransitionEvent(participant);
		transition.reason = TransitionReason.AUTOMATIC;

		const session = await db.createSession(participant);
		const triggerEvent = await db.createEvent(session);

		const notifier = createMockParticipantActivityNotifier();

		const saveTransition = createSaveParticipantTransition({
			dataSource: db.dataSource,
			notifier,
			log: jest.fn(),
		});

		const t = await saveTransition(
			participant,
			transition,
			triggerEvent,
		);

		expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
		expect(t).toBeDefined();
		expect(t?.id).toBeGreaterThan(0);
	});

	it('should not save the transition more than once for the same participant and the same transition', async () => {
		const flaky = async () => {
			const notifier = createMockParticipantActivityNotifier();

			const saveTransition = createSaveParticipantTransition({
				dataSource: db.dataSource,
				notifier,
				log: jest.fn(),
			});

			const participant = await db.createParticipant();

			const nParallel = 10;

			const transitions = Array.from({length: nParallel}, () => db.createTransitionEvent(participant));

			await Promise.allSettled(transitions.map(async transition => saveTransition(participant, transition, undefined)));

			expect(notifier.onPhaseChange).toHaveBeenCalledTimes(1);
		};

		for (let i = 0; i < 10; ++i) {
			// eslint-disable-next-line no-await-in-loop
			await flaky();
		}
	});
});

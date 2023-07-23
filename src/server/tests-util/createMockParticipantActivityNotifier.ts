import {type ParticipantActivityNotifier} from '../lib/externalNotifier';

export const createMockParticipantActivityNotifier = (): ParticipantActivityNotifier => {
	const notifier: ParticipantActivityNotifier = {
		notifyActive: jest.fn(),
		notifyInstalled: jest.fn(),
		notifyPhaseChange: jest.fn(),
	};

	return notifier;
};

export default createMockParticipantActivityNotifier;

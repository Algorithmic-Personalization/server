import {type ParticipantActivityHandler} from '../lib/externalNotifier';

export const createMockParticipantActivityNotifier = (): ParticipantActivityHandler => {
	const notifier: ParticipantActivityHandler = {
		onActive: jest.fn(),
		onInstalled: jest.fn(),
		onPhaseChange: jest.fn(),
	};

	return notifier;
};

export default createMockParticipantActivityNotifier;

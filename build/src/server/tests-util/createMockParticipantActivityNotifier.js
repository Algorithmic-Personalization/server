"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockParticipantActivityNotifier = void 0;
const createMockParticipantActivityNotifier = () => {
    const notifier = {
        notifyActive: jest.fn(),
        notifyInstalled: jest.fn(),
        notifyPhaseChange: jest.fn(),
    };
    return notifier;
};
exports.createMockParticipantActivityNotifier = createMockParticipantActivityNotifier;
exports.default = exports.createMockParticipantActivityNotifier;
//# sourceMappingURL=createMockParticipantActivityNotifier.js.map
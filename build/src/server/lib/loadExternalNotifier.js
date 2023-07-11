"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultNotifier = exports.makeDefaultExternalNotifier = exports.getExternalNotifierConfig = void 0;
const event_1 = require("./../../common/models/event");
const util_1 = require("../../common/util");
const getExternalNotifierConfig = (generalConfigData) => {
    if (!(0, util_1.has)('external-notifier')(generalConfigData) || !generalConfigData['external-notifier'] || typeof generalConfigData['external-notifier'] !== 'object') {
        throw new Error('missing external-notifier key in config');
    }
    const { 'external-notifier': externalNotifier } = generalConfigData;
    if (!(0, util_1.has)('email')(externalNotifier) || !externalNotifier.email || typeof externalNotifier.email !== 'string') {
        throw new Error('missing or invalid email key in external-notifier config');
    }
    return {
        email: externalNotifier.email,
    };
};
exports.getExternalNotifierConfig = getExternalNotifierConfig;
const makeDefaultExternalNotifier = (config) => ({ mailer }) => ({
    makeParticipantNotifier: (data) => ({
        notifyActive(d) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email: to } = config;
                const subject = `<${event_1.EventType.PHASE_TRANSITION}}> Update for User <${data.participantCode}>`;
                const text = `Participant <${data.participantCode}> <${event_1.EventType.EXTENSION_ACTIVATED}> as of <${d.getTime()}>`;
                return mailer({ to, subject, text });
            });
        },
        notifyInstalled(d) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email: to } = config;
                const subject = `<${event_1.EventType.EXTENSION_INSTALLED}}> Update for User <${data.participantCode}>`;
                const text = `Participant <${data.participantCode}> <${event_1.EventType.EXTENSION_INSTALLED}> as of <${d.getTime()}>`;
                return mailer({ to, subject, text });
            });
        },
        notifyPhaseChange(d, from_phase, to_phase) {
            return __awaiter(this, void 0, void 0, function* () {
                const { email: to } = config;
                const subject = `<${event_1.EventType.PHASE_TRANSITION}}> Update for User <${data.participantCode}>`;
                const text = `Participant <${data.participantCode}> transitioned from phase <${from_phase} to phase <${to_phase}> on <${d.getTime()}>`;
                return mailer({ to, subject, text });
            });
        },
    }),
});
exports.makeDefaultExternalNotifier = makeDefaultExternalNotifier;
const createDefaultNotifier = (config) => (services) => {
    const notifierConf = (0, exports.getExternalNotifierConfig)(config);
    return (0, exports.makeDefaultExternalNotifier)(notifierConf)(services);
};
exports.createDefaultNotifier = createDefaultNotifier;
exports.default = exports.createDefaultNotifier;
//# sourceMappingURL=loadExternalNotifier.js.map
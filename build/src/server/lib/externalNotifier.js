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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultNotifier = exports.makeDefaultExternalNotifier = exports.getExternalNotifierConfig = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const event_1 = require("../../common/models/event");
const util_1 = require("../../common/util");
const voucherService_1 = __importDefault(require("../lib/voucherService"));
// eslint-disable-next-line complexity
const getExternalNotifierConfig = (generalConfigData) => {
    if (!(0, util_1.has)('external-notifier')(generalConfigData) || !generalConfigData['external-notifier'] || typeof generalConfigData['external-notifier'] !== 'object') {
        throw new Error('missing external-notifier key in config');
    }
    const { 'external-notifier': externalNotifier } = generalConfigData;
    if (!(0, util_1.has)('email')(externalNotifier) || !externalNotifier.email || typeof externalNotifier.email !== 'string') {
        throw new Error('missing or invalid email key in external-notifier config');
    }
    if (!(0, util_1.has)('token-url')(externalNotifier) || !externalNotifier['token-url'] || typeof externalNotifier['token-url'] !== 'string') {
        throw new Error('missing or invalid token-url key in external-notifier config');
    }
    if (!(0, util_1.has)('client-id')(externalNotifier) || !externalNotifier['client-id'] || typeof externalNotifier['client-id'] !== 'string') {
        throw new Error('missing or invalid client-id key in external-notifier config');
    }
    if (!(0, util_1.has)('client-secret')(externalNotifier) || !externalNotifier['client-secret'] || typeof externalNotifier['client-secret'] !== 'string') {
        throw new Error('missing or invalid client-secret key in external-notifier config');
    }
    if (!(0, util_1.has)('survey-id')(externalNotifier) || !externalNotifier['survey-id'] || typeof externalNotifier['survey-id'] !== 'string') {
        throw new Error('missing or invalid survey-id key in external-notifier config');
    }
    if (!(0, util_1.has)('update-url')(externalNotifier) || !externalNotifier['update-url'] || typeof externalNotifier['update-url'] !== 'string') {
        throw new Error('missing or invalid update-url key in external-notifier config');
    }
    return {
        email: externalNotifier.email,
        'token-url': externalNotifier['token-url'],
        'client-id': externalNotifier['client-id'],
        'client-secret': externalNotifier['client-secret'],
        'survey-id': externalNotifier['survey-id'],
        'update-url': externalNotifier['update-url'],
    };
};
exports.getExternalNotifierConfig = getExternalNotifierConfig;
const makeOauthNotifier = (_log) => (config) => {
    const preAuth = `${config['client-id']}:${config['client-secret']}`;
    const auth = Buffer.from(preAuth).toString('base64');
    let theToken;
    const getToken = () => __awaiter(void 0, void 0, void 0, function* () {
        return (0, node_fetch_1.default)(config['token-url'], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: `Basic ${auth}`,
            },
            body: 'grant_type=client_credentials&scope=write:survey_responses',
        }).then((res) => __awaiter(void 0, void 0, void 0, function* () {
            const data = yield res.json();
            if (!data || typeof data !== 'object') {
                throw new Error('invalid response from token endpoint');
            }
            const { expires_in: expiresIn, access_token: accessToken } = data;
            if (!expiresIn || typeof expiresIn !== 'number') {
                throw new Error('invalid response from token endpoint (missing expires_in)');
            }
            if (!accessToken || typeof accessToken !== 'string') {
                throw new Error('invalid response from token endpoint (missing access_token)');
            }
            return { accessToken, expiresIn };
        }));
    });
    const refreshToken = () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield getToken();
        theToken = data.accessToken;
        setTimeout(refreshToken, Math.max(data.expiresIn - (60 * 5), 0));
    });
    const ensureToken = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!theToken) {
            yield refreshToken();
        }
        return theToken;
    });
    const put = (participantCode, data) => __awaiter(void 0, void 0, void 0, function* () {
        const token = yield ensureToken();
        const res = yield (0, node_fetch_1.default)(config['update-url'].replace('{RESPONSE_ID}', participantCode), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error('failed to update data');
        }
        return res.json();
    });
    const notifyInstalled = (d, participantCode) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            surveyId: config['survey-id'],
            resetRecordedDate: true,
            embeddedData: {
                installedExtensionAt: d.getTime(),
            },
        };
        return put(participantCode, data);
    });
    const notifyActive = (d, participantCode, voucherCode) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            surveyId: config['survey-id'],
            resetRecordedDate: true,
            embeddedData: {
                activatedExtensionAt: d.getTime(),
                voucherCode,
            },
        };
        return put(participantCode, data);
    });
    const notifyPhaseChanged = (date, participantCode, from, to) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            surveyId: config['survey-id'],
            resetRecordedDate: true,
            embeddedData: {
                fromPhase: from,
                toPhase: to,
                phaseChangedAt: date.getTime(),
            },
        };
        return put(participantCode, data);
    });
    return { notifyActive, notifyPhaseChanged, notifyInstalled };
};
const makeDefaultExternalNotifier = (config) => ({ mailer, dataSource, log }) => {
    const voucherService = (0, voucherService_1.default)({
        dataSource,
        log,
    });
    log('info', 'creating external notifier', config);
    const oauth = makeOauthNotifier(log)(config);
    return {
        makeParticipantNotifier: (data) => ({
            onActive(d) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { email: to } = config;
                    const subject = `"${event_1.EventType.PHASE_TRANSITION}}" Update for User "${data.participantCode}"`;
                    const getCode = () => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const voucher = yield voucherService.getAndMarkOneAsUsed(data.participantId);
                        return (_a = voucher === null || voucher === void 0 ? void 0 : voucher.voucherCode) !== null && _a !== void 0 ? _a : '<no vouchers left>';
                    });
                    const voucherString = data.isPaid ? yield getCode() : '<participant not paid>';
                    const text = `Participant "${data.participantCode}" "${event_1.EventType.EXTENSION_ACTIVATED}" as of "${d.getTime()}" VoucherCode sent: "${voucherString}"`;
                    yield Promise.all([
                        mailer({ to, subject, text }),
                        oauth.notifyActive(d, data.participantCode, voucherString),
                    ]);
                });
            },
            onInstalled(d) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { email: to } = config;
                    const { participantCode } = data;
                    const subject = `"${event_1.EventType.EXTENSION_INSTALLED}" Update for User "${participantCode}"`;
                    const text = `Participant "${participantCode}" "${event_1.EventType.EXTENSION_INSTALLED}" as of "${d.getTime()}"`;
                    yield Promise.all([
                        mailer({ to, subject, text }),
                        oauth.notifyInstalled(d, participantCode),
                    ]);
                });
            },
            onPhaseChange(d, from_phase, to_phase) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { email: to } = config;
                    const subject = `"${event_1.EventType.PHASE_TRANSITION}}" Update for User "${data.participantCode}"`;
                    const text = `Participant "${data.participantCode}" transitioned from phase "${from_phase}" to phase "${to_phase}" on "${d.getTime()}"`;
                    yield Promise.all([
                        mailer({ to, subject, text }),
                        oauth.notifyPhaseChanged(d, data.participantCode, from_phase, to_phase),
                    ]);
                });
            },
        }),
    };
};
exports.makeDefaultExternalNotifier = makeDefaultExternalNotifier;
const createDefaultNotifier = (config) => (services) => {
    const notifierConf = (0, exports.getExternalNotifierConfig)(config);
    return (0, exports.makeDefaultExternalNotifier)(notifierConf)(services);
};
exports.createDefaultNotifier = createDefaultNotifier;
exports.default = exports.createDefaultNotifier;
//# sourceMappingURL=externalNotifier.js.map
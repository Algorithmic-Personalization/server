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
exports.createExternalNotifier = exports.getExternalEventsEndpointConfig = void 0;
const util_1 = require("../../common/util");
const ensureRecord_1 = __importDefault(require("./config-loader/ensureRecord"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getExternalEventsEndpointConfig = (conf) => {
    (0, ensureRecord_1.default)(conf);
    if (!(0, util_1.has)('external-events-endpoint')(conf) || typeof conf['external-events-endpoint'] !== 'object') {
        throw new Error('Missing or invalid external-events-endpoint config key in config.yaml');
    }
    const extEndpoint = conf['external-events-endpoint'];
    if (!(0, util_1.has)('url')(extEndpoint) || typeof extEndpoint.url !== 'string') {
        throw new Error('Missing or invalid url key in external-events-endpoint config');
    }
    if (!(0, util_1.has)('token')(extEndpoint) || typeof extEndpoint.token !== 'string') {
        throw new Error('Missing or invalid token key in external-events-endpoint config');
    }
    return {
        url: extEndpoint.url,
        token: extEndpoint.token,
    };
};
exports.getExternalEventsEndpointConfig = getExternalEventsEndpointConfig;
const createExternalNotifier = (config, participantCode, log) => {
    const post = (payload) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const resp = yield (0, node_fetch_1.default)(config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-TOKEN': config.token,
                },
                body: JSON.stringify(payload),
            });
            if (resp.ok) {
                void resp.json().then(json => {
                    log('success', 'notifying external server of', payload, 'got response', json);
                });
                return true;
            }
            void resp.json().then(json => {
                log('error', 'notifying external server of', payload, 'got response', json);
            });
            return false;
        }
        catch (err) {
            log('error', 'notifying external server:', err);
            return false;
        }
    });
    return {
        notifyActive(d) {
            return __awaiter(this, void 0, void 0, function* () {
                const payload = {
                    updates: [{
                            responseId: participantCode,
                            embeddedData: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                activated_timestamp: d.getTime(),
                            },
                        }],
                    ignoreMissingResponses: false,
                };
                return post(payload);
            });
        },
        notifyInterventionPeriod(d) {
            return __awaiter(this, void 0, void 0, function* () {
                const payload = {
                    updates: [{
                            responseId: participantCode,
                            embeddedData: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                intervention_period_timestamp: d.getTime(),
                            },
                        }],
                    ignoreMissingResponses: false,
                };
                return post(payload);
            });
        },
    };
};
exports.createExternalNotifier = createExternalNotifier;
exports.default = exports.getExternalEventsEndpointConfig;
//# sourceMappingURL=externalEventsEndpoint.js.map
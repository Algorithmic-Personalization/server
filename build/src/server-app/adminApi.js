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
exports.createAdminApi = void 0;
const serverRoutes_1 = require("../server/serverRoutes");
const getActivityReport_1 = require("../server/api-2/getActivityReport");
const createTransitionSetting_1 = require("../server/api-2/createTransitionSetting");
const getTransitionSetting_1 = require("../server/api-2/getTransitionSetting");
const updateParticipant_1 = require("../server/api-2/updateParticipant");
const util_1 = require("../common/util");
const loadItem = (key) => {
    const item = sessionStorage.getItem(key);
    if (!item) {
        return undefined;
    }
    return JSON.parse(item);
};
const createAdminApi = (serverUrl, showLoginModal) => {
    console.log('adminApi', serverUrl);
    let token = loadItem('token');
    let admin = loadItem('admin');
    const verb = (0, util_1.makeApiVerbCreator)(serverUrl);
    const wasLoggedIn = () => sessionStorage.getItem('wasLoggedIn') === 'true';
    const decorate = verb => (url, data, h) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield verb(url, data, h);
        if ((0, util_1.isMaybe)(result)) {
            if (result.kind === 'Failure') {
                if (result.code === 'NOT_AUTHENTICATED' && wasLoggedIn()) {
                    token = undefined;
                    admin = undefined;
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('admin');
                    if (showLoginModal) {
                        showLoginModal();
                    }
                }
            }
        }
        return result;
    });
    const get = decorate(verb('GET'));
    const post = decorate(verb('POST'));
    const del = decorate(verb('DELETE'));
    const put = decorate(verb('PUT'));
    const headers = () => {
        var _a;
        return ({
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `${(_a = token === null || token === void 0 ? void 0 : token.token) !== null && _a !== void 0 ? _a : ''}`,
        });
    };
    return {
        getAdmin() {
            return admin;
        },
        isLoggedIn() {
            return Boolean(token) && Boolean(admin);
        },
        wasLoggedIn() {
            return wasLoggedIn();
        },
        setAuth(t, a) {
            token = t;
            admin = a;
            sessionStorage.setItem('token', JSON.stringify(t));
            sessionStorage.setItem('admin', JSON.stringify(a));
            sessionStorage.setItem('wasLoggedIn', 'true');
        },
        login(email, password) {
            return __awaiter(this, void 0, void 0, function* () {
                return post(serverRoutes_1.postLogin, { email, password }, headers());
            });
        },
        register(admin) {
            return __awaiter(this, void 0, void 0, function* () {
                return post(serverRoutes_1.postRegister, admin, headers());
            });
        },
        getAuthTest() {
            return __awaiter(this, void 0, void 0, function* () {
                return get(serverRoutes_1.getAuthTest, {}, headers());
            });
        },
        uploadParticipants(file) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const formData = new FormData();
                formData.set('participants', file);
                const result = yield fetch(`${serverUrl}${serverRoutes_1.postUploadParticipants}`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: `${(_a = token === null || token === void 0 ? void 0 : token.token) !== null && _a !== void 0 ? _a : ''}`,
                    },
                });
                try {
                    const json = yield result.json();
                    if ((0, util_1.isMaybe)(json)) {
                        return json;
                    }
                }
                catch (e) {
                    console.error(e);
                    return {
                        kind: 'Failure',
                        message: `Invalid response from server: ${(0, util_1.getMessage)(e, 'unknown error')}`,
                    };
                }
                return {
                    kind: 'Failure',
                    message: 'Invalid response from server',
                };
            });
        },
        getParticipants(filters, page, pageSize = 15) {
            return __awaiter(this, void 0, void 0, function* () {
                return get(`${serverRoutes_1.getParticipants}/${page}`, Object.assign(Object.assign({}, filters), { pageSize }), headers());
            });
        },
        getParticipantOverview(participantCode) {
            return __awaiter(this, void 0, void 0, function* () {
                return get(`${serverRoutes_1.getParticipantOverview}/${participantCode}`, {}, headers());
            });
        },
        getEventOverviews(sessionUuid) {
            return __awaiter(this, void 0, void 0, function* () {
                return get(`${serverRoutes_1.getEventOverviews}/${sessionUuid}`, {}, headers());
            });
        },
        getEvents(page = 0, pageSize = 15) {
            return __awaiter(this, void 0, void 0, function* () {
                return get(`${serverRoutes_1.getEvents}/${page}`, { pageSize }, headers());
            });
        },
        getExperimentConfig() {
            return __awaiter(this, void 0, void 0, function* () {
                return get(serverRoutes_1.getExperimentConfig, {}, headers());
            });
        },
        postExperimentConfig(config) {
            return __awaiter(this, void 0, void 0, function* () {
                return post(serverRoutes_1.getExperimentConfig, config, headers());
            });
        },
        getExperimentConfigHistory() {
            return __awaiter(this, void 0, void 0, function* () {
                return get(serverRoutes_1.getExperimentConfigHistory, {}, headers());
            });
        },
        getApiTokens() {
            return __awaiter(this, void 0, void 0, function* () {
                return get(serverRoutes_1.getApiTokens, {}, headers());
            });
        },
        createApiToken(name) {
            return __awaiter(this, void 0, void 0, function* () {
                return post(serverRoutes_1.createApiToken, { name }, headers());
            });
        },
        deleteApiToken(token) {
            return __awaiter(this, void 0, void 0, function* () {
                return del(serverRoutes_1.deleteApiToken.replace(':token', token), {}, headers());
            });
        },
        getActivityReport() {
            return __awaiter(this, void 0, void 0, function* () {
                return get(getActivityReport_1.createGetActivityReportDefinition.path, {}, headers());
            });
        },
        createTransitionSetting(setting) {
            return __awaiter(this, void 0, void 0, function* () {
                return post(createTransitionSetting_1.createTransitionSettingDefinition.path, setting, headers());
            });
        },
        getTransitionSetting(from, to) {
            return __awaiter(this, void 0, void 0, function* () {
                const { path } = getTransitionSetting_1.getTransitionSettingDefinition;
                return get(path, { from, to }, headers());
            });
        },
        updateParticipantPhase(participantCode, phase) {
            return __awaiter(this, void 0, void 0, function* () {
                const { path } = updateParticipant_1.updateParticipantDefinition;
                return put(path.replace(':code', participantCode), { phase }, headers());
            });
        },
    };
};
exports.createAdminApi = createAdminApi;
//# sourceMappingURL=adminApi.js.map
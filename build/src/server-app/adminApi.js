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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createAdminApi = void 0;
var routes_1 = require("../common/routes");
var util_1 = require("../common/util");
var loadItem = function (key) {
    var item = sessionStorage.getItem(key);
    if (!item) {
        return undefined;
    }
    return JSON.parse(item);
};
var createAdminApi = function (serverUrl, showLoginModal) {
    console.log('adminApi', serverUrl);
    var token = loadItem('token');
    var admin = loadItem('admin');
    var verb = (0, util_1.makeApiVerbCreator)(serverUrl);
    var wasLoggedIn = function () { return sessionStorage.getItem('wasLoggedIn') === 'true'; };
    var decorate = function (verb) { return function (url, data, h) { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, verb(url, data, h)];
                case 1:
                    result = _a.sent();
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
                    return [2 /*return*/, result];
            }
        });
    }); }; };
    var get = decorate(verb('GET'));
    var post = decorate(verb('POST'));
    var headers = function () {
        var _a;
        return ({
            'Content-Type': 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: "".concat((_a = token === null || token === void 0 ? void 0 : token.token) !== null && _a !== void 0 ? _a : '')
        });
    };
    return {
        getAdmin: function () {
            return admin;
        },
        isLoggedIn: function () {
            return Boolean(token) && Boolean(admin);
        },
        wasLoggedIn: function () {
            return wasLoggedIn();
        },
        setAuth: function (t, a) {
            token = t;
            admin = a;
            sessionStorage.setItem('token', JSON.stringify(t));
            sessionStorage.setItem('admin', JSON.stringify(a));
            sessionStorage.setItem('wasLoggedIn', 'true');
        },
        login: function (email, password) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, post(routes_1.postLogin, { email: email, password: password }, headers())];
                });
            });
        },
        register: function (admin) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, post(routes_1.postRegister, admin, headers())];
                });
            });
        },
        getAuthTest: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get(routes_1.getAuthTest, {}, headers())];
                });
            });
        },
        uploadParticipants: function (file) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var formData, result, json, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            formData = new FormData();
                            formData.set('participants', file);
                            return [4 /*yield*/, fetch("".concat(serverUrl).concat(routes_1.postUploadParticipants), {
                                    method: 'POST',
                                    body: formData,
                                    headers: {
                                        // eslint-disable-next-line @typescript-eslint/naming-convention
                                        Authorization: "".concat((_a = token === null || token === void 0 ? void 0 : token.token) !== null && _a !== void 0 ? _a : '')
                                    }
                                })];
                        case 1:
                            result = _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, result.json()];
                        case 3:
                            json = _b.sent();
                            if ((0, util_1.isMaybe)(json)) {
                                return [2 /*return*/, json];
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _b.sent();
                            console.error(e_1);
                            return [2 /*return*/, {
                                    kind: 'Failure',
                                    message: "Invalid response from server: ".concat((0, util_1.getMessage)(e_1, 'unknown error'))
                                }];
                        case 5: return [2 /*return*/, {
                                kind: 'Failure',
                                message: 'Invalid response from server'
                            }];
                    }
                });
            });
        },
        getParticipants: function (page, emailLike, pageSize) {
            if (pageSize === void 0) { pageSize = 15; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get("".concat(routes_1.getParticipants, "/").concat(page, "?pageSize=").concat(pageSize, "&emailLike=").concat(encodeURIComponent(emailLike)), {}, headers())];
                });
            });
        },
        getParticipantOverview: function (participantEmail) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get("".concat(routes_1.getParticipantOverview, "/").concat(participantEmail), {}, headers())];
                });
            });
        },
        getEventOverviews: function (sessionUuid) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get("".concat(routes_1.getEventOverviews, "/").concat(sessionUuid), {}, headers())];
                });
            });
        },
        getEvents: function (page, pageSize) {
            if (page === void 0) { page = 0; }
            if (pageSize === void 0) { pageSize = 15; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get("".concat(routes_1.getEvents, "/").concat(page, "?pageSize=").concat(pageSize), {}, headers())];
                });
            });
        },
        getExperimentConfig: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get(routes_1.getExperimentConfig, {}, headers())];
                });
            });
        },
        postExperimentConfig: function (config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, post(routes_1.getExperimentConfig, config, headers())];
                });
            });
        },
        getExperimentConfigHistory: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, get(routes_1.getExperimentConfigHistory, {}, headers())];
                });
            });
        }
    };
};
exports.createAdminApi = createAdminApi;

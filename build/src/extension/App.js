"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var event_1 = __importDefault(require("../server/models/event"));
var MessageC_1 = __importDefault(require("../server-app/components/MessageC"));
var RecommendationsListC_1 = __importDefault(require("./components/RecommendationsListC"));
var lib_1 = require("./lib");
var apiProvider_1 = require("./apiProvider");
var loadLocalConfig = function () {
    var item = sessionStorage.getItem('cfg');
    if (item) {
        return JSON.parse(item);
    }
    return undefined;
};
var App = function () {
    var _a;
    var localCode = (_a = localStorage.getItem('participantCode')) !== null && _a !== void 0 ? _a : '';
    var _b = __read((0, react_1.useState)(''), 2), currentUrl = _b[0], setCurrentUrl = _b[1];
    var _c = __read((0, react_1.useState)(localCode), 2), participantCode = _c[0], setParticipantCode = _c[1];
    var _d = __read((0, react_1.useState)(localCode !== ''), 2), participantCodeValid = _d[0], setParticipantCodeValid = _d[1];
    var _e = __read((0, react_1.useState)(), 2), error = _e[0], setError = _e[1];
    var _f = __read((0, react_1.useState)(loadLocalConfig()), 2), cfg = _f[0], setCfg = _f[1];
    var _g = __read((0, react_1.useState)(false), 2), loggedIn = _g[0], setLoggedIn = _g[1];
    var api = (0, apiProvider_1.useApi)();
    var handleLogout = function () {
        api.logout();
        sessionStorage.removeItem('cfg');
        setParticipantCode('');
        setParticipantCodeValid(false);
    };
    var updateUrl = function () {
        if (window.location.href !== currentUrl) {
            (0, lib_1.log)('SETTING CURRENT URL', window.location.href);
            setCurrentUrl(window.location.href);
        }
    };
    var updateLoggedIn = function () {
        var loggedInWidget = document.querySelector('#avatar-btn');
        if (loggedInWidget) {
            setLoggedIn(true);
        }
        else {
            setLoggedIn(false);
        }
    };
    var postEvent = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var enrichedEvent;
        return __generator(this, function (_a) {
            enrichedEvent = new event_1["default"]();
            Object.assign(enrichedEvent, e);
            if (cfg) {
                enrichedEvent.experimentConfigId = cfg.experimentConfigId;
            }
            api.postEvent(enrichedEvent, true)["catch"](console.error);
            return [2 /*return*/];
        });
    }); };
    (0, react_1.useEffect)(function () {
        updateUrl();
        updateLoggedIn();
        var observer = new MutationObserver(function () {
            updateUrl();
            updateLoggedIn();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        return function () {
            observer.disconnect();
        };
    });
    (0, react_1.useEffect)(function () {
        if (participantCode === '') {
            return;
        }
        api.getConfig().then(function (c) {
            if (c.kind === 'Success') {
                setCfg(c.value);
                sessionStorage.setItem('cfg', JSON.stringify(c.value));
            }
            else {
                console.error('Could not get config:', c.message);
            }
        })["catch"](console.error);
    }, [currentUrl, participantCode, participantCodeValid]);
    var handleSubmit = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var valid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setError(undefined);
                    if (participantCode === undefined) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, api.checkParticipantCode(participantCode)];
                case 1:
                    valid = _a.sent();
                    if (!valid) {
                        setError('Invalid participant code');
                        return [2 /*return*/];
                    }
                    setParticipantCodeValid(true);
                    api.setAuth(participantCode);
                    api.newSession()["catch"](console.error);
                    return [2 /*return*/];
            }
        });
    }); };
    if (!loggedIn) {
        return (react_1["default"].createElement(material_1.Typography, null, "You need to be logged in to YouTube to use this extension."));
    }
    if (!participantCodeValid) {
        return (react_1["default"].createElement("form", { onSubmit: handleSubmit },
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                } },
                react_1["default"].createElement(material_1.Typography, { sx: { mb: 2 } },
                    "Welcome to the experiment!",
                    react_1["default"].createElement("br", null),
                    "Please enter your participant code to continue."),
                react_1["default"].createElement(material_1.TextField, { label: 'Participant Code', value: participantCode, onChange: function (e) {
                        setParticipantCode(e.target.value);
                    } }),
                react_1["default"].createElement(material_1.FormHelperText, null, "This is the code that has been give to you by e-mail."),
                react_1["default"].createElement(material_1.Button, { type: 'submit', variant: 'contained' }, "Submit"),
                react_1["default"].createElement(MessageC_1["default"], { message: error, type: 'error' }))));
    }
    if (!cfg) {
        return (react_1["default"].createElement(material_1.Typography, null, "Loading config..."));
    }
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(RecommendationsListC_1["default"], { url: currentUrl, cfg: cfg, postEvent: postEvent }),
        react_1["default"].createElement(material_1.Link, { onClick: handleLogout, sx: {
                my: 2,
                display: 'block'
            } }, "log out of experiment")));
};
exports["default"] = App;

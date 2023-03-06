"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.ExperimentConfigC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
var CardC_1 = __importDefault(require("./shared/CardC"));
var experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
var adminApiProvider_1 = require("../adminApiProvider");
var PhaseC = function (_a) {
    var from = _a.from, to = _a.to;
    var ui = (react_1["default"].createElement(material_1.Box, { component: material_1.Paper, sx: {
            p: 2,
            mb: 2
        } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h2' },
            "Move participants from phase\u00A0",
            from,
            " to phase\u00A0",
            to,
            "..."),
        react_1["default"].createElement(material_1.Typography, { variant: 'body2', sx: { mb: 1 } },
            "...once they have met ",
            react_1["default"].createElement("strong", null, "any"),
            " of the following ",
            react_1["default"].createElement("strong", null, "daily"),
            " criteria:"),
        react_1["default"].createElement(material_1.Box, { sx: {
                '& .MuiTextField-root': { m: 1 }
            } },
            react_1["default"].createElement(material_1.Box, { sx: { mb: 1 } },
                react_1["default"].createElement(material_1.TextField, { label: 'Pages viewed', type: 'number', helperText: 'Minimum number of pages viewed' }),
                react_1["default"].createElement(material_1.TextField, { label: 'Video pages viewed', type: 'number', helperText: 'Minimum number of video pages viewed' })),
            react_1["default"].createElement(material_1.Box, { sx: { mb: 1 } },
                react_1["default"].createElement(material_1.TextField, { label: 'Recommendations clicked', type: 'number', helperText: 'Minimum number of sidebar recommendations clicked' })),
            react_1["default"].createElement(material_1.Box, { sx: { mb: 1 } },
                react_1["default"].createElement(material_1.TextField, { label: 'Watch time', type: 'number', helperText: 'Minimum total watch time in minutes' }),
                react_1["default"].createElement(material_1.TextField, { label: 'Time spent on YouTube', type: 'number', helperText: 'Minimum time spent on YouTube in minutes, approximate' })),
            react_1["default"].createElement(material_1.Typography, { variant: 'body2', sx: { mb: 1 } },
                "for ",
                react_1["default"].createElement("strong", null, "at least"),
                ":"),
            react_1["default"].createElement(material_1.TextField, { sx: { display: 'block' }, label: 'Number of days', type: 'number', helperText: 'Minimum number of days to trigger the phase transition, not necessarily consecutive' }),
            from > 0 && (react_1["default"].createElement(material_1.Typography, { variant: 'body2', sx: { mt: 2, mb: 1 } },
                react_1["default"].createElement("strong", null, "Note"),
                " that this number of days is counted since the entry of the the participant into phase\u00A0",
                from,
                ", they are not cumulative with the days spent in phase\u00A0",
                from - 1,
                ".")))));
    return ui;
};
var ExperimentConfigC = function () {
    var _a = __read((0, react_1.useState)(), 2), message = _a[0], setMessage = _a[1];
    var _b = __read((0, react_1.useState)(new experimentConfig_1["default"]()), 2), config = _b[0], setConfig = _b[1];
    var _c = __read((0, react_1.useState)(false), 2), configLoaded = _c[0], setConfigLoaded = _c[1];
    var _d = __read((0, react_1.useState)([]), 2), configHistory = _d[0], setConfigHistory = _d[1];
    var api = (0, adminApiProvider_1.useAdminApi)();
    var _e = __read((0, react_1.useState)(''), 2), probaField = _e[0], setProbaField = _e[1];
    var loadHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
        var configHistory;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api.getExperimentConfigHistory()];
                case 1:
                    configHistory = _a.sent();
                    if (configHistory.kind === 'Success') {
                        setConfigHistory(configHistory.value);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        if (!configLoaded) {
            setConfigLoaded(true);
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                var config;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, api.getExperimentConfig()];
                        case 1:
                            config = _a.sent();
                            if (config.kind === 'Success') {
                                setConfig(config.value);
                                setProbaField(config.value.nonPersonalizedProbability.toString());
                            }
                            else {
                                setMessage({
                                    text: config.message,
                                    severity: 'error'
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
        if (configHistory.length === 0) {
            loadHistory()["catch"](console.error);
        }
    }, [configLoaded]);
    var handleProbabilityChange = function (event) {
        setProbaField(event.target.value);
        var proba = parseFloat(event.target.value);
        if (proba <= 1 && proba >= 0) {
            setConfig(__assign(__assign({}, config), { nonPersonalizedProbability: parseFloat(event.target.value) }));
        }
        else {
            setMessage({
                text: 'Probability must be between 0 and 1',
                severity: 'error'
            });
        }
    };
    var handleSubmit = function (e) {
        e.preventDefault();
        setMessage({
            text: 'Saving config...'
        });
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.postExperimentConfig(config)];
                    case 1:
                        response = _a.sent();
                        if (response.kind === 'Success') {
                            setMessage({
                                text: 'Config saved',
                                severity: 'success'
                            });
                            setConfig(response.value);
                            setProbaField(response.value.nonPersonalizedProbability.toString());
                        }
                        else {
                            setMessage({
                                text: response.message,
                                severity: 'error'
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
        loadHistory()["catch"](console.error);
    };
    var ui = (react_1["default"].createElement(material_1.Box, null,
        react_1["default"].createElement(NotificationsC_1["default"], { message: message }),
        react_1["default"].createElement(material_1.Grid, { container: true, spacing: 8 },
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, component: 'section' },
                react_1["default"].createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Phase transitioning"),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { my: 2 } },
                    react_1["default"].createElement("strong", null, "This is just a UI proposal, nothing is implemented!!")),
                react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: {
                        mb: 2,
                        '& a:visited': { color: 'inherit' },
                        '& a': { color: 'inherit' }
                    } },
                    "Here you can configure how participants are moved from one phase to another.",
                    react_1["default"].createElement("br", null),
                    "There are three phases, numbered 0, 1 and 2.",
                    react_1["default"].createElement("br", null),
                    "A participant starts in phase 0, and moves on to the subsequent phases according to the criteria you define below.",
                    react_1["default"].createElement("br", null),
                    "The setting of the ",
                    react_1["default"].createElement("a", { href: '#setting' }, "non-personalized"),
                    " probability only applies to participants in phase 1.",
                    react_1["default"].createElement("br", null),
                    "Otherwise this probability is ",
                    react_1["default"].createElement("strong", null, "zero"),
                    ", so that the user experience is as close to the regular YouTube as possible."),
                react_1["default"].createElement(PhaseC, { from: 0, to: 1 }),
                react_1["default"].createElement(PhaseC, { from: 1, to: 2 })),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 6, component: 'section', id: 'setting' },
                react_1["default"].createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Experiment Config"),
                react_1["default"].createElement("form", { onSubmit: handleSubmit },
                    react_1["default"].createElement(material_1.Box, { sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        } },
                        react_1["default"].createElement(material_1.FormControl, null,
                            react_1["default"].createElement(material_1.TextField, { label: 'Non-personalized probability', type: 'number', inputProps: { min: 0, max: 1, step: 0.01 }, id: 'nonPersonalizedProbability', value: probaField, onChange: handleProbabilityChange }),
                            react_1["default"].createElement(material_1.FormHelperText, null, "Probability of showing a non-personalized recommendation")),
                        react_1["default"].createElement(material_1.FormControl, null,
                            react_1["default"].createElement(material_1.TextField, { label: 'Comment about this version of the configuration', id: 'comment', value: config.comment, onChange: function (e) {
                                    setConfig(__assign(__assign({}, config), { comment: e.target.value }));
                                } })),
                        react_1["default"].createElement(material_1.FormHelperText, null, "Useful to remember why you changed the config"),
                        react_1["default"].createElement(material_1.Box, null,
                            react_1["default"].createElement(material_1.Button, { type: 'submit', variant: 'contained', sx: { mt: 2 } }, "Save"))))),
            react_1["default"].createElement(material_1.Grid, { item: true, xs: 12, sm: 6, component: 'section' },
                react_1["default"].createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Configurations History"),
                configHistory.length === 0 && react_1["default"].createElement(material_1.Typography, null, "No configurations found in history"),
                react_1["default"].createElement(material_1.Grid, { container: true, spacing: 2 }, configHistory.map(function (c) {
                    var _a, _b;
                    return (react_1["default"].createElement(material_1.Grid, { key: c.id, item: true, xs: 12 },
                        react_1["default"].createElement(CardC_1["default"], null,
                            react_1["default"].createElement(material_1.Typography, null,
                                react_1["default"].createElement("strong", null,
                                    "#",
                                    c.id),
                                " created on ",
                                new Date(c.createdAt).toLocaleDateString(),
                                "\u00A0by: ", (_b = (_a = c.admin) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : 'unknown'),
                            react_1["default"].createElement("dl", null,
                                react_1["default"].createElement("dt", null,
                                    react_1["default"].createElement(material_1.Typography, null,
                                        react_1["default"].createElement("strong", null, "Non-personalized probability"))),
                                react_1["default"].createElement("dd", null,
                                    react_1["default"].createElement(material_1.Typography, null, c.nonPersonalizedProbability)),
                                react_1["default"].createElement("dt", null,
                                    react_1["default"].createElement(material_1.Typography, null,
                                        react_1["default"].createElement("strong", null, "Comment"))),
                                react_1["default"].createElement("dd", null,
                                    react_1["default"].createElement(material_1.Typography, null, c.comment))))));
                }))))));
    return ui;
};
exports.ExperimentConfigC = ExperimentConfigC;
exports["default"] = exports.ExperimentConfigC;

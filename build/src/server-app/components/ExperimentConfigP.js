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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentConfigC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const CardC_1 = __importDefault(require("./shared/CardC"));
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const transitionSetting_1 = __importStar(require("../../server/models/transitionSetting"));
const adminApiProvider_1 = require("../adminApiProvider");
const createTransitionSetting = (from, to) => {
    const setting = new transitionSetting_1.default();
    setting.fromPhase = from;
    setting.toPhase = to;
    return setting;
};
const PhaseC = ({ from, to }) => {
    const api = (0, adminApiProvider_1.useAdminApi)();
    const [setting, setSetting] = (0, react_1.useState)(createTransitionSetting(from, to));
    const [message, setMessage] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const setting = yield api.getTransitionSetting(from, to);
            if (setting.kind === 'Success') {
                setSetting(setting.value);
            }
        }))();
    }, [from, to]);
    const ui = (react_1.default.createElement("form", { onSubmit: (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const result = yield api.createTransitionSetting(setting);
            if (result.kind === 'Success') {
                setMessage({
                    severity: 'success',
                    text: `Phase transition settings from phase ${setting.fromPhase} to phase ${setting.toPhase} saved!`,
                });
            }
            else {
                setMessage({
                    severity: 'error',
                    text: result.message,
                });
            }
        }) },
        react_1.default.createElement(material_1.Box, { component: material_1.Paper, sx: {
                p: 2,
                mb: 2,
            } },
            react_1.default.createElement(material_1.Typography, { variant: 'h2' },
                "Move participants from phase\u00A0",
                from,
                " to phase\u00A0",
                to,
                "..."),
            react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: { mb: 1 } }, "...once they have met"),
            react_1.default.createElement(material_1.FormControl, { sx: { width: 235 } },
                react_1.default.createElement(material_1.InputLabel, { id: `transition-type-label-${from}-${to}` }, "Operator"),
                react_1.default.createElement(material_1.Select, { labelId: `transition-type-label-${from}-${to}`, label: 'Operator', value: setting.operator, onChange: e => {
                        setSetting(Object.assign(Object.assign({}, setting), { operator: e.target.value }));
                    } },
                    react_1.default.createElement(material_1.MenuItem, { value: transitionSetting_1.OperatorType.ALL }, transitionSetting_1.OperatorType.ALL),
                    react_1.default.createElement(material_1.MenuItem, { value: transitionSetting_1.OperatorType.ANY }, transitionSetting_1.OperatorType.ANY))),
            react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: { mb: 2 } },
                "of the following ",
                react_1.default.createElement("strong", null, "daily"),
                " criteria:"),
            react_1.default.createElement(material_1.Box, { sx: {
                    '& .MuiTextField-root': { m: 1 },
                } },
                react_1.default.createElement(material_1.Box, { sx: { mb: 1 } },
                    react_1.default.createElement(material_1.TextField, { label: 'Pages viewed', type: 'number', helperText: 'Minimum number of pages viewed', value: setting.minPagesViewed, onChange: e => {
                            setSetting(Object.assign(Object.assign({}, setting), { minPagesViewed: parseInt(e.target.value, 10) }));
                        } }),
                    react_1.default.createElement(material_1.TextField, { label: 'Video pages viewed', type: 'number', helperText: 'Minimum number of video pages viewed', value: setting.minVideoPagesViewed, onChange: e => {
                            setSetting(Object.assign(Object.assign({}, setting), { minVideoPagesViewed: parseInt(e.target.value, 10) }));
                        } })),
                react_1.default.createElement(material_1.Box, { sx: { mb: 1 } },
                    react_1.default.createElement(material_1.TextField, { label: 'Recommendations clicked', type: 'number', helperText: 'Minimum number of sidebar recommendations clicked', value: setting.minSidebarRecommendationsClicked, onChange: e => {
                            setSetting(Object.assign(Object.assign({}, setting), { minSidebarRecommendationsClicked: parseInt(e.target.value, 10) }));
                        } })),
                react_1.default.createElement(material_1.Box, { sx: { mb: 1 } },
                    react_1.default.createElement(material_1.TextField, { label: 'Watch time', type: 'number', helperText: 'Minimum total watch time in minutes', value: setting.minVideoTimeViewedSeconds / 60, onChange: e => {
                            setSetting(Object.assign(Object.assign({}, setting), { minVideoTimeViewedSeconds: parseFloat(e.target.value) * 60 }));
                        } }),
                    react_1.default.createElement(material_1.TextField, { label: 'Time spent on YouTube', type: 'number', helperText: 'Minimum time spent on YouTube in minutes, approximate', value: setting.minTimeSpentOnYoutubeSeconds / 60, onChange: e => {
                            setSetting(Object.assign(Object.assign({}, setting), { minTimeSpentOnYoutubeSeconds: parseFloat(e.target.value) * 60 }));
                        } })),
                react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: { mb: 1 } },
                    "for ",
                    react_1.default.createElement("strong", null, "at least"),
                    ":"),
                react_1.default.createElement(material_1.TextField, { sx: { display: 'block' }, label: 'Number of days', type: 'number', helperText: 'Minimum number of days to trigger the phase transition, not necessarily consecutive', value: setting.minDays, onChange: e => {
                        setSetting(Object.assign(Object.assign({}, setting), { minDays: parseInt(e.target.value, 10) }));
                    } }),
                from > 0 && (react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: { mt: 2, mb: 1 } },
                    react_1.default.createElement("strong", null, "Note"),
                    " that this number of days is counted since the entry of the the participant into phase\u00A0",
                    from,
                    ", they are not cumulative with the days spent in phase\u00A0",
                    from - 1,
                    ".")),
                react_1.default.createElement(material_1.Button, { variant: 'contained', type: 'submit', color: 'primary', sx: { m: 2 } }, "Save"),
                react_1.default.createElement(NotificationsC_1.default, { message: message })))));
    return ui;
};
const ExperimentConfigC = () => {
    const [message, setMessage] = (0, react_1.useState)();
    const [config, setConfig] = (0, react_1.useState)(new experimentConfig_1.default());
    const [configLoaded, setConfigLoaded] = (0, react_1.useState)(false);
    const [configHistory, setConfigHistory] = (0, react_1.useState)([]);
    const api = (0, adminApiProvider_1.useAdminApi)();
    const [probaField, setProbaField] = (0, react_1.useState)('');
    const loadHistory = () => __awaiter(void 0, void 0, void 0, function* () {
        const configHistory = yield api.getExperimentConfigHistory();
        if (configHistory.kind === 'Success') {
            setConfigHistory(configHistory.value);
        }
    });
    (0, react_1.useEffect)(() => {
        if (!configLoaded) {
            setConfigLoaded(true);
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const config = yield api.getExperimentConfig();
                if (config.kind === 'Success') {
                    setConfig(config.value);
                    setProbaField(config.value.nonPersonalizedProbability.toString());
                }
                else {
                    setMessage({
                        text: config.message,
                        severity: 'error',
                    });
                }
            }))();
        }
        if (configHistory.length === 0) {
            loadHistory().catch(console.error);
        }
    }, [configLoaded]);
    const handleProbabilityChange = (event) => {
        setProbaField(event.target.value);
        const proba = parseFloat(event.target.value);
        if (proba <= 1 && proba >= 0) {
            setConfig(Object.assign(Object.assign({}, config), { nonPersonalizedProbability: parseFloat(event.target.value) }));
        }
        else {
            setMessage({
                text: 'Probability must be between 0 and 1',
                severity: 'error',
            });
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage({
            text: 'Saving config...',
        });
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield api.postExperimentConfig(config);
            if (response.kind === 'Success') {
                setMessage({
                    text: 'Config saved',
                    severity: 'success',
                });
                setConfig(response.value);
                setProbaField(response.value.nonPersonalizedProbability.toString());
            }
            else {
                setMessage({
                    text: response.message,
                    severity: 'error',
                });
            }
        }))();
        loadHistory().catch(console.error);
    };
    const ui = (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(NotificationsC_1.default, { message: message }),
        react_1.default.createElement(material_1.Grid, { container: true, spacing: 8 },
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, component: 'section' },
                react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Phase transitioning"),
                react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: {
                        mb: 2,
                        '& a:visited': { color: 'inherit' },
                        '& a': { color: 'inherit' },
                    } },
                    "Here you can configure how participants are moved from one phase to another.",
                    react_1.default.createElement("br", null),
                    "There are three phases, numbered 0, 1 and 2.",
                    react_1.default.createElement("br", null),
                    "A participant starts in phase 0, and moves on to the subsequent phases according to the criteria you define below.",
                    react_1.default.createElement("br", null),
                    "The setting of the ",
                    react_1.default.createElement("a", { href: '#setting' }, "non-personalized"),
                    " probability only applies to participants in phase 1.",
                    react_1.default.createElement("br", null),
                    "Otherwise this probability is ",
                    react_1.default.createElement("strong", null, "zero"),
                    ", so that the user experience is as close to the regular YouTube as possible."),
                react_1.default.createElement(PhaseC, { from: 0, to: 1 }),
                react_1.default.createElement(PhaseC, { from: 1, to: 2 })),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, sm: 6, component: 'section', id: 'setting' },
                react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Experiment Config"),
                react_1.default.createElement("form", { onSubmit: handleSubmit },
                    react_1.default.createElement(material_1.Box, { sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        } },
                        react_1.default.createElement(material_1.FormControl, null,
                            react_1.default.createElement(material_1.TextField, { label: 'Non-personalized probability', type: 'number', inputProps: { min: 0, max: 1, step: 0.01 }, id: 'nonPersonalizedProbability', value: probaField, onChange: handleProbabilityChange }),
                            react_1.default.createElement(material_1.FormHelperText, null, "Probability of showing a non-personalized recommendation")),
                        react_1.default.createElement(material_1.FormControl, null,
                            react_1.default.createElement(material_1.TextField, { label: 'Comment about this version of the configuration', id: 'comment', value: config.comment, onChange: e => {
                                    setConfig(Object.assign(Object.assign({}, config), { comment: e.target.value }));
                                } })),
                        react_1.default.createElement(material_1.FormHelperText, null, "Useful to remember why you changed the config"),
                        react_1.default.createElement(material_1.Box, null,
                            react_1.default.createElement(material_1.Button, { type: 'submit', variant: 'contained', sx: { mt: 2 } }, "Save"))))),
            react_1.default.createElement(material_1.Grid, { item: true, xs: 12, sm: 6, component: 'section' },
                react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Configurations History"),
                configHistory.length === 0 && react_1.default.createElement(material_1.Typography, null, "No configurations found in history"),
                react_1.default.createElement(material_1.Grid, { container: true, spacing: 2 }, configHistory.map(c => {
                    var _a, _b;
                    return (react_1.default.createElement(material_1.Grid, { key: c.id, item: true, xs: 12 },
                        react_1.default.createElement(CardC_1.default, null,
                            react_1.default.createElement(material_1.Typography, null,
                                react_1.default.createElement("strong", null,
                                    "#",
                                    c.id),
                                " created on ",
                                new Date(c.createdAt).toLocaleDateString(),
                                "\u00A0by: ", (_b = (_a = c.admin) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : 'unknown'),
                            react_1.default.createElement("dl", null,
                                react_1.default.createElement("dt", null,
                                    react_1.default.createElement(material_1.Typography, null,
                                        react_1.default.createElement("strong", null, "Non-personalized probability"))),
                                react_1.default.createElement("dd", null,
                                    react_1.default.createElement(material_1.Typography, null, c.nonPersonalizedProbability)),
                                react_1.default.createElement("dt", null,
                                    react_1.default.createElement(material_1.Typography, null,
                                        react_1.default.createElement("strong", null, "Comment"))),
                                react_1.default.createElement("dd", null,
                                    react_1.default.createElement(material_1.Typography, null, c.comment))))));
                }))))));
    return ui;
};
exports.ExperimentConfigC = ExperimentConfigC;
exports.default = exports.ExperimentConfigC;
//# sourceMappingURL=ExperimentConfigP.js.map
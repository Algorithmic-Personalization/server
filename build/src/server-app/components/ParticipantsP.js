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
exports.ParticipantsC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const FileUpload_1 = __importDefault(require("@mui/icons-material/FileUpload"));
const Search_1 = __importDefault(require("@mui/icons-material/Search"));
const react_router_dom_1 = require("react-router-dom");
const DownloadLinkC_1 = __importDefault(require("./shared/DownloadLinkC"));
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const TableC_1 = __importDefault(require("./shared/TableC"));
const adminApiProvider_1 = require("../adminApiProvider");
// @ts-expect-error this is a text file, not a module
const participants_sample_csv_1 = __importDefault(require("../../../public/participants.sample.csv"));
const transitionSetting_1 = require("../../server/models/transitionSetting");
const tableDescriptor = {
    headers: [
        {
            key: 'code',
            element: 'Participant Code',
        },
        {
            key: 'experiment-arm',
            element: 'Experiment arm',
        },
        {
            key: 'phase',
            element: 'Experiment Phase',
        },
    ],
    rows: p => ({
        key: p.code,
        elements: [
            // eslint-disable-next-line react/jsx-key
            react_1.default.createElement(react_router_dom_1.Link, { to: `/participants/${p.code}` }, p.code),
            p.arm,
            p.phase,
        ],
    }),
};
const TableC = (0, TableC_1.default)(tableDescriptor);
const UploadFormC = () => {
    const exampleString = participants_sample_csv_1.default;
    const [message, setMessage] = (0, react_1.useState)();
    const form = (0, react_1.useRef)(null);
    const api = (0, adminApiProvider_1.useAdminApi)();
    const onFileChange = (e) => {
        var _a, _b;
        const file = (_b = (_a = e.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b[0];
        if (!file) {
            return;
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            setMessage({
                text: 'Uploading participants file...',
            });
            const res = yield api.uploadParticipants(file);
            if (res.kind === 'Success') {
                setMessage({
                    text: res.value,
                    severity: 'success',
                });
            }
            else {
                setMessage({
                    text: res.message,
                    severity: 'error',
                });
            }
            if (form.current) {
                form.current.reset();
            }
        }))();
    };
    const example = (react_1.default.createElement(material_1.Box, { sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, null,
            react_1.default.createElement("strong", null, "Example file:"),
            "\u00A0",
            react_1.default.createElement(DownloadLinkC_1.default, { href: '/participants.sample.csv' }, "(download)")),
        react_1.default.createElement("pre", { style: { marginTop: 0, maxWidth: '100%', overflow: 'auto' } }, exampleString)));
    const ui = (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Add Participants"),
        react_1.default.createElement(material_1.Typography, { variant: 'body1', component: 'div', sx: { mb: 2 } },
            "You can add participants to the experiment by uploading a CSV file, it should have at least the following 2 columns:",
            react_1.default.createElement("ul", null,
                react_1.default.createElement("li", null, "code"),
                react_1.default.createElement("li", null, "arm")),
            "where \"arm\" is either \"control\" or \"treatment\".",
            react_1.default.createElement("br", null),
            react_1.default.createElement("strong", null, "Note:"),
            " The \"code\" column should contain large random values so that participant codes cannot be guessed."),
        example,
        react_1.default.createElement("form", { ref: form },
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2 } },
                react_1.default.createElement(material_1.Button, { component: 'label', variant: 'outlined', htmlFor: 'list', endIcon: react_1.default.createElement(FileUpload_1.default, null) },
                    "Upload CSV",
                    react_1.default.createElement("input", { hidden: true, type: 'file', id: 'list', name: 'list', accept: '.csv', onChange: onFileChange })),
                react_1.default.createElement(material_1.FormHelperText, null, "The separator must be a comma.")),
            react_1.default.createElement(NotificationsC_1.default, { message: message }))));
    return ui;
};
const ListC = () => {
    var _a;
    const [participants, setParticipants] = (0, react_1.useState)();
    const [pageInput, setPageInput] = (0, react_1.useState)('1');
    const pTmp = Math.min(Math.max(parseInt(pageInput, 10), 0), (_a = participants === null || participants === void 0 ? void 0 : participants.pageCount) !== null && _a !== void 0 ? _a : 1);
    const pageInputOk = Number.isInteger(pTmp);
    const page = pageInputOk ? pTmp : 1;
    const [message, setMessage] = (0, react_1.useState)();
    const [codeLike, setCodeLike] = (0, react_1.useState)('');
    const [phase, setPhase] = (0, react_1.useState)(-1);
    const api = (0, adminApiProvider_1.useAdminApi)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield api.getParticipants(page - 1, codeLike, phase);
            if (res.kind === 'Success') {
                setParticipants(res.value);
            }
            else {
                setMessage({
                    text: res.message,
                    severity: 'error',
                });
            }
        }))();
    }, [page, codeLike, phase]);
    if (participants === undefined) {
        return react_1.default.createElement(material_1.Typography, null, "Loading...");
    }
    const list = (react_1.default.createElement(material_1.Box, null,
        react_1.default.createElement(material_1.Box, { sx: {
                mb: 2,
                display: 'flex',
                alignItems: 'stretch',
                flexDirection: 'column',
                width: 'max-content',
                gap: 1,
            } },
            react_1.default.createElement(material_1.TextField, { value: codeLike, onChange: e => {
                    setCodeLike(e.target.value);
                    setPageInput('1');
                }, sx: { display: 'block' }, label: 'Search participant by email', InputProps: {
                    endAdornment: (react_1.default.createElement(material_1.InputAdornment, { position: 'end' },
                        react_1.default.createElement(Search_1.default, null))),
                } }),
            react_1.default.createElement(material_1.FormControl, null,
                react_1.default.createElement(material_1.InputLabel, { id: 'participant-phase-search' }, "Filter by phase"),
                react_1.default.createElement(material_1.Select, { labelId: 'participant-phase-search', label: 'Filter by phase', onChange: e => {
                        setPhase(e.target.value);
                        setPageInput('1');
                    }, value: phase },
                    react_1.default.createElement(material_1.MenuItem, { value: -1 }, "Any"),
                    react_1.default.createElement(material_1.MenuItem, { value: transitionSetting_1.Phase.PRE_EXPERIMENT }, "Pre-Experiment"),
                    react_1.default.createElement(material_1.MenuItem, { value: transitionSetting_1.Phase.EXPERIMENT }, "Experiment"),
                    react_1.default.createElement(material_1.MenuItem, { value: transitionSetting_1.Phase.POST_EXPERIMENT }, "Post-Experiment"))),
            react_1.default.createElement(material_1.Box, { sx: { display: 'flex', alignItems: 'center' } },
                react_1.default.createElement(material_1.Typography, { variant: 'body2' }, "Page\u00A0"),
                react_1.default.createElement("input", { type: 'number', value: pageInputOk ? page : pageInput, min: 1, max: participants.pageCount, step: 1, onChange: e => {
                        setPageInput(e.target.value);
                    } }),
                react_1.default.createElement(material_1.Typography, { variant: 'body2' }, "\u00A0/\u00A0"),
                react_1.default.createElement(material_1.Typography, { variant: 'body2' }, participants.pageCount))),
        react_1.default.createElement(TableC, { items: participants.results })));
    return (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Participants list"),
        react_1.default.createElement(NotificationsC_1.default, { message: message }),
        list));
};
const ParticipantsC = () => (react_1.default.createElement("div", null,
    react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Participants"),
    react_1.default.createElement(ListC, null),
    react_1.default.createElement(UploadFormC, null)));
exports.ParticipantsC = ParticipantsC;
exports.default = exports.ParticipantsC;
//# sourceMappingURL=ParticipantsP.js.map
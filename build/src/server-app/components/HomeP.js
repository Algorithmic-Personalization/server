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
exports.HomeC = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const adminApiProvider_1 = require("../adminApiProvider");
const TableC_1 = __importDefault(require("./shared/TableC"));
const tableDescriptor = {
    headers: [
        {
            key: 'activityDay',
            element: 'Activity day',
        },
        {
            key: 'participant',
            element: 'Participant',
        },
        {
            key: 'pages-viewed',
            element: 'Pages viewed',
        },
        {
            key: 'video-pages-viewed',
            element: 'Video pages viewed',
        },
        {
            key: 'sidebar-clicked',
            element: 'Sidebar recommendations clicked',
        },
        {
            key: 'watch-time',
            element: 'Watch time (minutes)',
        },
        {
            key: 'youtube-time',
            element: 'Approximate time spent on YouTube (minutes)',
        },
    ],
    rows: a => {
        var _a, _b, _c, _d;
        return ({
            key: a.id.toString(),
            elements: [
                new Date(a.createdAt).toLocaleDateString(),
                // eslint-disable-next-line react/jsx-key
                react_1.default.createElement(react_router_dom_1.Link, { to: `/participants/${(_b = (_a = a.participant) === null || _a === void 0 ? void 0 : _a.code) !== null && _b !== void 0 ? _b : 'unknown'}` }, (_d = (_c = a.participant) === null || _c === void 0 ? void 0 : _c.code) !== null && _d !== void 0 ? _d : '<unknown, this is a bug>'),
                a.pagesViewed,
                a.videoPagesViewed,
                a.sidebarRecommendationsClicked,
                Math.round(a.videoTimeViewedSeconds / 60),
                Math.round(a.timeSpentOnYoutubeSeconds / 60),
            ],
        });
    },
};
const TableC = (0, TableC_1.default)(tableDescriptor);
const ActivityReportC = ({ report }) => {
    const ui = (react_1.default.createElement("div", null,
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Activity Report"),
        react_1.default.createElement(TableC, { items: report.latest })));
    return ui;
};
const HomeC = () => {
    const [report, setReport] = (0, react_1.useState)();
    const [message, setMessage] = (0, react_1.useState)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const report = yield api.getActivityReport();
            if (report.kind === 'Success') {
                setReport(report.value);
            }
            else {
                setMessage({
                    text: report.message,
                    severity: 'error',
                });
            }
        }))();
    }, []);
    const ui = (react_1.default.createElement("div", null,
        react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Home"),
        react_1.default.createElement(NotificationsC_1.default, { message: message }),
        !report && react_1.default.createElement(material_1.Typography, null, "Loading report..."),
        report && react_1.default.createElement(ActivityReportC, { report: report })));
    return ui;
};
exports.HomeC = HomeC;
exports.default = exports.HomeC;
//# sourceMappingURL=HomeP.js.map
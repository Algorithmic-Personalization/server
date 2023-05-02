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
exports.MonitoringC = void 0;
const react_1 = __importStar(require("react"));
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const material_1 = require("@mui/material");
const dayjs_1 = __importDefault(require("dayjs"));
const x_date_pickers_1 = require("@mui/x-date-pickers");
const adminApiProvider_1 = require("../adminApiProvider");
const TableC_1 = require("./shared/TableC");
const mostViewedDescriptor = {
    headers: [
        {
            key: 'url',
            element: 'URL',
        },
        {
            key: 'count',
            element: 'Count',
        },
    ],
    rows: e => ({
        key: e.url,
        elements: [
            e.url,
            e.count,
        ],
    }),
};
const shareDescriptor = {
    headers: [
        ...mostViewedDescriptor.headers,
        {
            key: 'share',
            element: 'Share of total',
        },
    ],
    rows: e => ({
        key: mostViewedDescriptor.rows(e).key,
        elements: [
            ...mostViewedDescriptor.rows(e).elements,
            `${(e.share * 100).toFixed(2)}%`,
        ],
    }),
};
const groupByUrlType = (items) => {
    var _a;
    const groups = new Map();
    const getType = (urlStr) => {
        try {
            const url = new URL(urlStr);
            const type = url.pathname.split('/')[1];
            return type;
        }
        catch (e) {
            return urlStr;
        }
    };
    const normalizeType = (type) => {
        if (!type.startsWith('/')) {
            return `/${type}`;
        }
        return type;
    };
    for (const item of items) {
        const type = normalizeType(getType(item.url));
        const count = (_a = groups.get(type)) !== null && _a !== void 0 ? _a : 0;
        groups.set(type, count + item.count);
    }
    return [...groups.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({
        url: type,
        count,
    }));
};
const addShare = (items) => {
    const total = items.reduce((acc, item) => acc + item.count, 0);
    return items.map(item => (Object.assign(Object.assign({}, item), { share: item.count / total })));
};
const MostViewedTableC = (0, TableC_1.createTableComponent)(mostViewedDescriptor);
const ShareTableC = (0, TableC_1.createTableComponent)(shareDescriptor);
const ReportC = ({ data }) => (react_1.default.createElement(material_1.Box, { component: material_1.Paper, sx: { my: 4, p: 2 } },
    react_1.default.createElement(material_1.Typography, { variant: 'h4' }, "KPIs"),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Unique active participants: ",
        data.nUniqueParticipants),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Total number of pages viewed: ",
        data.nPagesViewed),
    react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
        "Average request latency: ",
        data.averageLatency,
        " ms"),
    react_1.default.createElement(material_1.Typography, { variant: 'h4' }, "Most viewed paths"),
    react_1.default.createElement(ShareTableC, { items: addShare(groupByUrlType(data.mostViewedPages)) }),
    react_1.default.createElement(material_1.Box, { sx: { my: 2 } },
        react_1.default.createElement("hr", null)),
    react_1.default.createElement(material_1.Typography, { variant: 'h4' }, "Most viewed pages"),
    react_1.default.createElement(MostViewedTableC, { items: data.mostViewedPages })));
const MonitoringC = () => {
    const fromRef = (0, react_1.useRef)(null);
    const toRef = (0, react_1.useRef)(null);
    const [fromDate, setFromDate] = (0, react_1.useState)((0, dayjs_1.default)().subtract(1, 'week'));
    const [toDate, setToDate] = (0, react_1.useState)((0, dayjs_1.default)());
    const [report, setReport] = (0, react_1.useState)();
    const [message, setMessage] = (0, react_1.useState)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const data = yield api.getMonitoringReport({ fromDate: fromDate.toDate(), toDate: toDate.toDate() });
            if (data.kind === 'Success') {
                setReport(data.value);
            }
            else {
                setMessage({
                    severity: 'error',
                    text: data.message,
                });
            }
        }))();
    }, [fromDate, toDate]);
    if (fromRef.current) {
        fromRef.current.id = 'fromDate';
    }
    if (toRef.current) {
        toRef.current.id = 'toDate';
    }
    const ui = (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Monitoring"),
        react_1.default.createElement(NotificationsC_1.default, { message: message }),
        react_1.default.createElement(material_1.Paper, { sx: { m: 2, p: 2 } },
            react_1.default.createElement(material_1.Box, null,
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'fromDate' }, "Start date"),
                react_1.default.createElement(x_date_pickers_1.DatePicker, { inputRef: fromRef, value: (0, dayjs_1.default)(fromDate), onChange: e => {
                        if (e) {
                            setFromDate(e);
                        }
                    } })),
            react_1.default.createElement(material_1.Box, null,
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'toDate' }, "End date"),
                react_1.default.createElement(x_date_pickers_1.DatePicker, { inputRef: toRef, value: (0, dayjs_1.default)(toDate), onChange: e => {
                        if (e) {
                            setToDate(e);
                        }
                    } }))),
        report && react_1.default.createElement(ReportC, { data: report }),
        !report && react_1.default.createElement(material_1.Typography, null, "Loading report")));
    return ui;
};
exports.MonitoringC = MonitoringC;
exports.default = exports.MonitoringC;
//# sourceMappingURL=Monitoring.js.map
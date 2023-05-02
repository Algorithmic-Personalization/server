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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringC = void 0;
const material_1 = require("@mui/material");
const react_1 = __importStar(require("react"));
const dayjs_1 = __importDefault(require("dayjs"));
const x_date_pickers_1 = require("@mui/x-date-pickers");
const MonitoringC = () => {
    const fromRef = (0, react_1.useRef)(null);
    const toRef = (0, react_1.useRef)(null);
    const [fromDate, setFromDate] = (0, react_1.useState)((0, dayjs_1.default)().subtract(1, 'week'));
    const [toDate, setToDate] = (0, react_1.useState)((0, dayjs_1.default)());
    if (fromRef.current) {
        fromRef.current.id = 'fromDate';
    }
    if (toRef.current) {
        toRef.current.id = 'toDate';
    }
    const ui = (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Monitoring"),
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
                    } })))));
    return ui;
};
exports.MonitoringC = MonitoringC;
exports.default = exports.MonitoringC;
//# sourceMappingURL=Monitoring.js.map
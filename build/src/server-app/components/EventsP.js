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
exports.EventsC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const adminApiProvider_1 = require("../adminApiProvider");
const TableC_1 = __importDefault(require("./shared/TableC"));
const util_1 = require("./shared/util");
const tableDescriptor = {
    headers: [
        {
            key: 'id',
            element: 'Event ID',
        },
        {
            key: 'type',
            element: 'Event type',
        },
        {
            key: 'timestamp',
            element: 'Timestamp',
        },
        {
            key: 'sessionUuid',
            element: 'Session UUID',
        },
        {
            key: 'url',
            element: 'URL',
        },
    ],
    rows: e => ({
        key: e.id.toString(),
        elements: [
            e.id.toString(),
            e.type,
            new Date(e.createdAt),
            e.sessionUuid,
            // eslint-disable-next-line react/jsx-key
            react_1.default.createElement(util_1.UrlC, { url: e.url }),
        ],
    }),
};
const TableC = (0, TableC_1.default)(tableDescriptor);
const EventsC = () => {
    const [pageNumberControl, setPageNumberControl] = (0, react_1.useState)('1');
    const [pageNumber, setPageNumber] = (0, react_1.useState)(1);
    const [pageCount, setPageCount] = (0, react_1.useState)(0);
    const [events, setEvents] = (0, react_1.useState)([]);
    const api = (0, adminApiProvider_1.useAdminApi)();
    const handlePageNumberChange = (e) => {
        setPageNumberControl(e.target.value);
        const n = parseInt(e.target.value, 10);
        if (Number.isInteger(n) && n > 0) {
            setPageNumber(n);
        }
    };
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield api.getEvents(pageNumber - 1);
            if (res.kind === 'Success') {
                setPageCount(res.value.pageCount);
                setEvents(res.value.results);
            }
        }))();
    }, [pageNumber]);
    const ui = (react_1.default.createElement(material_1.Box, { component: 'main' },
        react_1.default.createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Events"),
        react_1.default.createElement(material_1.Typography, { sx: { display: 'flex', alignItems: 'center', mb: 2 } },
            react_1.default.createElement("span", null, "Page\u00A0"),
            react_1.default.createElement("input", { type: 'number', value: pageNumberControl, onChange: handlePageNumberChange, min: 1, max: pageCount, step: 1 }),
            react_1.default.createElement("span", null, "\u00A0/\u00A0"),
            react_1.default.createElement("span", null, pageCount)),
        react_1.default.createElement(TableC, { items: events })));
    return ui;
};
exports.EventsC = EventsC;
exports.default = exports.EventsC;
//# sourceMappingURL=EventsP.js.map
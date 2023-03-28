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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaginationComponent = exports.bind = exports.takeValue = exports.UrlC = exports.LinkC = exports.showDate = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const showDate = (d) => {
    const date = new Date(d);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
exports.showDate = showDate;
const LinkC = ({ href, label }) => (react_1.default.createElement("a", { target: '_blank', rel: 'noreferrer', href: href, style: {
        textDecoration: 'none',
        color: 'inherit',
    } },
    react_1.default.createElement(material_1.Typography, { variant: 'body1', color: 'blue' }, label)));
exports.LinkC = LinkC;
const UrlC = ({ url, prefix }) => {
    var _c, _d;
    const withYtHostName = url.startsWith('/') ? `https://youtube.com${url}` : url;
    const p = prefix !== null && prefix !== void 0 ? prefix : '';
    try {
        const u = new URL(withYtHostName);
        if (u.pathname === '/results') {
            return react_1.default.createElement(exports.LinkC, { href: withYtHostName, label: `${p}search: ${(_c = u.searchParams.get('search_query')) !== null && _c !== void 0 ? _c : ''}` });
        }
        if (u.pathname === '/watch') {
            return react_1.default.createElement(exports.LinkC, { href: withYtHostName, label: `${p}video: ${(_d = u.searchParams.get('v')) !== null && _d !== void 0 ? _d : ''}` });
        }
        return react_1.default.createElement(exports.LinkC, { href: withYtHostName, label: `${p}${u.pathname}` });
    }
    catch (e) {
        return react_1.default.createElement(react_1.default.Fragment, null,
            p,
            url);
    }
};
exports.UrlC = UrlC;
const takeValue = (fn) => (e) => {
    fn(e.target.value);
};
exports.takeValue = takeValue;
function bind(value, setValue) {
    return {
        value,
        onChange: (0, exports.takeValue)(setValue),
    };
}
exports.bind = bind;
function createPaginationComponent() {
    const PaginationC = ({ page: _a, onPageChange: _b }) => {
        const [_pageNumber, _setPageNumber] = (0, react_1.useState)();
        return react_1.default.createElement("div", null);
    };
    return PaginationC;
}
exports.createPaginationComponent = createPaginationComponent;
//# sourceMappingURL=util.js.map
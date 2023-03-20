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
exports.__esModule = true;
exports.createPaginationComponent = exports.bind = exports.takeValue = exports.UrlC = exports.LinkC = exports.showDate = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var showDate = function (d) {
    var date = new Date(d);
    return "".concat(date.toLocaleDateString(), " ").concat(date.toLocaleTimeString());
};
exports.showDate = showDate;
var LinkC = function (_c) {
    var href = _c.href, label = _c.label;
    return (react_1["default"].createElement("a", { target: '_blank', rel: 'noreferrer', href: href, style: {
            textDecoration: 'none',
            color: 'inherit'
        } },
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'blue' }, label)));
};
exports.LinkC = LinkC;
var UrlC = function (_c) {
    var _d, _e;
    var url = _c.url, prefix = _c.prefix;
    var withYtHostName = url.startsWith('/') ? "https://youtube.com".concat(url) : url;
    var p = prefix !== null && prefix !== void 0 ? prefix : '';
    try {
        var u = new URL(withYtHostName);
        if (u.pathname === '/results') {
            return react_1["default"].createElement(exports.LinkC, { href: withYtHostName, label: "".concat(p, "search: ").concat((_d = u.searchParams.get('search_query')) !== null && _d !== void 0 ? _d : '') });
        }
        if (u.pathname === '/watch') {
            return react_1["default"].createElement(exports.LinkC, { href: withYtHostName, label: "".concat(p, "video: ").concat((_e = u.searchParams.get('v')) !== null && _e !== void 0 ? _e : '') });
        }
        return react_1["default"].createElement(exports.LinkC, { href: withYtHostName, label: "".concat(p).concat(u.pathname) });
    }
    catch (e) {
        return react_1["default"].createElement(react_1["default"].Fragment, null,
            p,
            url);
    }
};
exports.UrlC = UrlC;
var takeValue = function (fn) {
    return function (e) {
        fn(e.target.value);
    };
};
exports.takeValue = takeValue;
function bind(value, setValue) {
    return {
        value: value,
        onChange: (0, exports.takeValue)(setValue)
    };
}
exports.bind = bind;
function createPaginationComponent() {
    var PaginationC = function (_c) {
        var _a = _c.page, _b = _c.onPageChange;
        var _d = __read((0, react_1.useState)(), 2), _pageNumber = _d[0], _setPageNumber = _d[1];
        return react_1["default"].createElement("div", null);
    };
    return PaginationC;
}
exports.createPaginationComponent = createPaginationComponent;
//# sourceMappingURL=util.js.map
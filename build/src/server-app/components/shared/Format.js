"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.UrlC = exports.LinkC = exports.showDate = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var showDate = function (d) {
    var date = new Date(d);
    return "".concat(date.toLocaleDateString(), " ").concat(date.toLocaleTimeString());
};
exports.showDate = showDate;
var LinkC = function (_a) {
    var href = _a.href, label = _a.label;
    return (react_1["default"].createElement("a", { target: '_blank', rel: 'noreferrer', href: href, style: {
            textDecoration: 'none',
            color: 'inherit'
        } },
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', color: 'blue' }, label)));
};
exports.LinkC = LinkC;
var UrlC = function (_a) {
    var _b, _c;
    var url = _a.url, prefix = _a.prefix;
    var withYtHostName = url.startsWith('/') ? "https://youtube.com".concat(url) : url;
    var p = prefix !== null && prefix !== void 0 ? prefix : '';
    try {
        var u = new URL(withYtHostName);
        if (u.pathname === '/results') {
            return react_1["default"].createElement(exports.LinkC, { href: withYtHostName, label: "".concat(p, "search: ").concat((_b = u.searchParams.get('search_query')) !== null && _b !== void 0 ? _b : '') });
        }
        if (u.pathname === '/watch') {
            return react_1["default"].createElement(exports.LinkC, { href: withYtHostName, label: "".concat(p, "video: ").concat((_c = u.searchParams.get('v')) !== null && _c !== void 0 ? _c : '') });
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

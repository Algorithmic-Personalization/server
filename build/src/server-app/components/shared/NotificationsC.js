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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsC = exports.FadeC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var defaultSeverity = 'info';
var getColor = function (severity) {
    switch (severity) {
        case 'error':
            return 'error.main';
        case 'success':
            return 'success.main';
        case 'info':
            return 'info.main';
        case 'warning':
            return 'warning.main';
        default:
            return 'info.main';
    }
};
var displayDuration = function (_severity) { return 10000; };
var FadeC = function (_a) {
    var displayForMs = _a.displayForMs, children = _a.children, permanent = _a.permanent;
    var _b = __read((0, react_1.useState)(true), 2), show = _b[0], setShow = _b[1];
    var timeout = 1000;
    (0, react_1.useEffect)(function () {
        if (permanent) {
            return;
        }
        setTimeout(function () {
            setShow(false);
        }, displayForMs - timeout);
    }, [children]);
    return react_1.default.createElement(material_1.Fade, { in: show, timeout: timeout }, children);
};
exports.FadeC = FadeC;
var NotificationsC = function (_a) {
    var message = _a.message;
    var _b = __read((0, react_1.useState)([]), 2), messages = _b[0], setMessages = _b[1];
    var _c = __read((0, react_1.useState)(0), 2), maxId = _c[0], setMaxId = _c[1];
    var _d = __read((0, react_1.useState)([]), 2), toKill = _d[0], setToKill = _d[1];
    var getId = function () {
        var id = maxId + 1;
        setMaxId(id);
        return id;
    };
    (0, react_1.useEffect)(function () {
        var e_1, _a;
        var _b;
        if (!message) {
            return;
        }
        var newMessages = __spreadArray([], __read(messages), false);
        var severity = (_b = message.severity) !== null && _b !== void 0 ? _b : defaultSeverity;
        var base = {
            severity: severity,
            displayForMs: displayDuration(severity),
            permanent: message.permanent,
        };
        var newIds = [];
        if (typeof message.text === 'string') {
            var id = getId();
            newMessages.push(__assign(__assign({}, base), { text: message.text, id: id }));
            newIds.push(id);
        }
        else {
            try {
                for (var _c = __values(message.text), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var text = _d.value;
                    var id = getId();
                    newMessages.push(__assign(__assign({}, base), { text: text, id: id }));
                    newIds.push(id);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        setMessages(newMessages);
        setTimeout(function () {
            setToKill(__spreadArray(__spreadArray([], __read(toKill), false), __read(newIds), false));
        }, base.displayForMs);
    }, [message]);
    (0, react_1.useEffect)(function () {
        if (toKill.length === 0) {
            return;
        }
        setMessages(messages.filter(function (m) { return !toKill.includes(m.id); }));
        setToKill([]);
    }, [toKill]);
    if (messages.length === 0) {
        return null;
    }
    return (react_1.default.createElement(material_1.Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: 1,
            my: 2,
        } }, messages.map(function (m) { return (react_1.default.createElement(exports.FadeC, { key: m.id, displayForMs: m.displayForMs, permanent: m.permanent },
        react_1.default.createElement(material_1.Typography, { variant: 'body2', color: getColor(m.severity), sx: {
                border: 1,
                borderColor: getColor(m.severity),
                borderRadius: 1,
                p: 2,
            } }, m.text))); })));
};
exports.NotificationsC = NotificationsC;
exports.default = exports.NotificationsC;
//# sourceMappingURL=NotificationsC.js.map
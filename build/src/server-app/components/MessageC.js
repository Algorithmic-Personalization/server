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
exports.__esModule = true;
exports.StatusMessageC = exports.MessageC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var MessageC = function (_a) {
    var message = _a.message, type = _a.type, disappearMs = _a.disappearMs, sx = _a.sx;
    var _b = __read((0, react_1.useState)(), 2), text = _b[0], setText = _b[1];
    var _c = __read((0, react_1.useState)(), 2), timeoutHandle = _c[0], setTimeoutHandle = _c[1];
    var disappear = disappearMs !== null && disappearMs !== void 0 ? disappearMs : 5000;
    console.log('message: ', message, 'text: ', text);
    (0, react_1.useEffect)(function () {
        setText(message);
    }, [message]);
    (0, react_1.useEffect)(function () {
        if (disappear > 0) {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
            var h = setTimeout(function () {
                console.log('timeout');
                setText(undefined);
            }, disappear);
            setTimeoutHandle(h);
        }
    }, [text, disappear]);
    if (!text) {
        return null;
    }
    var color = type === 'error' ? 'error.main' : type === 'success' ? 'success.main' : 'primary.main';
    return (react_1["default"].createElement(material_1.Box, null,
        react_1["default"].createElement(material_1.Box, { sx: __assign({ mt: 2, mb: 2, p: 2, borderColor: color, display: 'inline-block', borderRadius: 4 }, sx), border: 1 },
            react_1["default"].createElement(material_1.Typography, { color: color }, text))));
};
exports.MessageC = MessageC;
var StatusMessageC = function (_a) {
    var info = _a.info, success = _a.success, error = _a.error, sx = _a.sx;
    return (react_1["default"].createElement(material_1.Box, { sx: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch'
        } },
        react_1["default"].createElement(exports.MessageC, { message: error, type: 'error', sx: sx }),
        react_1["default"].createElement(exports.MessageC, { message: success, type: 'success', sx: sx }),
        react_1["default"].createElement(exports.MessageC, { message: info, type: 'info', sx: sx })));
};
exports.StatusMessageC = StatusMessageC;
exports["default"] = exports.MessageC;

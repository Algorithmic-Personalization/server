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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.StatusMessageC = exports.MessageC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var MessageC = function (_a) {
    var message = _a.message, type = _a.type, sx = _a.sx;
    if (!message) {
        return null;
    }
    var color = type === 'error' ? 'error.main' : type === 'success' ? 'success.main' : 'primary.main';
    return (react_1["default"].createElement(material_1.Box, null,
        react_1["default"].createElement(material_1.Box, { sx: __assign({ mt: 2, mb: 2, p: 2, borderColor: color, display: 'inline-block', borderRadius: 4 }, sx), border: 1 },
            react_1["default"].createElement(material_1.Typography, { color: color }, message))));
};
exports.MessageC = MessageC;
var StatusMessageC = function (_a) {
    var info = _a.info, success = _a.success, error = _a.error, sx = _a.sx;
    if (error) {
        return react_1["default"].createElement(exports.MessageC, { message: error, type: 'error', sx: sx });
    }
    if (success) {
        return react_1["default"].createElement(exports.MessageC, { message: success, type: 'success', sx: sx });
    }
    if (info) {
        return react_1["default"].createElement(exports.MessageC, { message: info, type: 'info', sx: sx });
    }
    return null;
};
exports.StatusMessageC = StatusMessageC;
exports["default"] = exports.MessageC;

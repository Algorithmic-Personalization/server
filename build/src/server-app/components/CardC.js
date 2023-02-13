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
exports.CardC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var CardC = function (_a) {
    var children = _a.children, sx = _a.sx;
    return (react_1["default"].createElement(material_1.Box, { sx: __assign({ borderRadius: 1, border: 1, borderColor: 'grey.300', padding: 2 }, sx) }, children));
};
exports.CardC = CardC;
exports["default"] = exports.CardC;

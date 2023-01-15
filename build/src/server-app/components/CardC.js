"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.CardC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var CardC = function (_a) {
    var children = _a.children;
    return (react_1["default"].createElement(material_1.Box, { sx: {
            borderRadius: 1,
            border: 1,
            borderColor: 'grey.300',
            padding: 2
        } }, children));
};
exports.CardC = CardC;
exports["default"] = exports.CardC;

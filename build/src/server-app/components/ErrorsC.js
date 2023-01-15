"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ErrorsC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var ErrorsC = function (_a) {
    var errors = _a.errors;
    if (errors.length === 0) {
        return null;
    }
    var color = 'error.main';
    return (react_1["default"].createElement(material_1.Box, { sx: {
            mt: 2,
            mb: 2,
            p: 2,
            borderColor: color,
            color: color
        }, border: 1 },
        react_1["default"].createElement(material_1.Typography, null, "Oops:"),
        react_1["default"].createElement("ul", null, errors.map(function (error, i) { return (react_1["default"].createElement("li", { key: i },
            react_1["default"].createElement(material_1.Typography, null, error))); }))));
};
exports.ErrorsC = ErrorsC;
exports["default"] = exports.ErrorsC;

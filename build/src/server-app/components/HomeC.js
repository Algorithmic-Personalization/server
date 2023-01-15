"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.HomeC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var UserWidgetC_1 = __importDefault(require("./UserWidgetC"));
var HomeC = function () {
    var ui = (react_1["default"].createElement("div", null,
        react_1["default"].createElement(material_1.Typography, { variant: 'h1', sx: { mb: 4 } }, "Home"),
        react_1["default"].createElement(UserWidgetC_1["default"], null)));
    return ui;
};
exports.HomeC = HomeC;
exports["default"] = exports.HomeC;

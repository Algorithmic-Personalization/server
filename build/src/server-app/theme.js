"use strict";
var _a, _b, _c;
exports.__esModule = true;
exports.theme = void 0;
var material_1 = require("@mui/material");
exports.theme = (0, material_1.createTheme)({});
exports.theme.typography.h1 = (_a = {
        fontSize: '1.5rem'
    },
    _a[exports.theme.breakpoints.up('sm')] = {
        fontSize: '2.5rem'
    },
    _a);
exports.theme.typography.h2 = (_b = {
        fontSize: '1.2rem'
    },
    _b[exports.theme.breakpoints.up('sm')] = {
        fontSize: '1.5rem'
    },
    _b);
exports.theme.typography.h3 = (_c = {
        fontSize: '1.1rem'
    },
    _c[exports.theme.breakpoints.up('sm')] = {
        fontSize: '1.2rem'
    },
    _c);
exports["default"] = exports.theme;

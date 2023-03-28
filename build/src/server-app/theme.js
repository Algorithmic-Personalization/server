"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const material_1 = require("@mui/material");
exports.theme = (0, material_1.createTheme)({});
exports.theme.typography.h1 = {
    fontSize: '1.5rem',
    [exports.theme.breakpoints.up('sm')]: {
        fontSize: '2.5rem',
    },
};
exports.theme.typography.h2 = {
    fontSize: '1.2rem',
    [exports.theme.breakpoints.up('sm')]: {
        fontSize: '1.5rem',
    },
};
exports.theme.typography.h3 = {
    fontSize: '1.1rem',
    [exports.theme.breakpoints.up('sm')]: {
        fontSize: '1.2rem',
    },
};
exports.theme.typography.h4 = {
    fontSize: '1rem',
    [exports.theme.breakpoints.up('sm')]: {
        fontSize: '1.2rem',
    },
};
exports.default = exports.theme;
//# sourceMappingURL=theme.js.map
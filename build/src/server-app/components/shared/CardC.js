"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardC = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const CardC = ({ children, sx }) => (react_1.default.createElement(material_1.Box, { sx: Object.assign({ borderRadius: 1, border: 1, borderColor: 'grey.300', padding: 2 }, sx) }, children));
exports.CardC = CardC;
exports.default = exports.CardC;
//# sourceMappingURL=CardC.js.map
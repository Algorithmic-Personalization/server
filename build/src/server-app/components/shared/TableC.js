"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTableComponent = void 0;
const react_1 = __importDefault(require("react"));
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const util_1 = require("./util");
const StyledRow = (0, styles_1.styled)(material_1.TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
}));
const decorateHeader = (element) => {
    if (typeof element === 'string') {
        return react_1.default.createElement(material_1.Typography, { variant: 'subtitle1' }, element);
    }
    return element;
};
const numberFormat = new Intl.NumberFormat();
const decorateValue = (element) => {
    if (element instanceof Date) {
        return react_1.default.createElement(material_1.Typography, { variant: 'body2' }, (0, util_1.showDate)(element));
    }
    if (typeof element === 'number') {
        return (react_1.default.createElement(material_1.Typography, { variant: 'body2' }, numberFormat.format(element)));
    }
    if (typeof element === 'string') {
        return react_1.default.createElement(material_1.Typography, { variant: 'body2' }, element);
    }
    return element;
};
function createTableComponent(descriptor) {
    const TableComponent = ({ items }) => {
        if (items.length === 0) {
            return react_1.default.createElement(material_1.Typography, { variant: 'body1' }, "No items");
        }
        const { headers } = descriptor;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(material_1.Box, { sx: {
                    display: {
                        xs: 'none',
                        lg: 'block',
                    },
                } },
                react_1.default.createElement(material_1.TableContainer, { component: material_1.Paper },
                    react_1.default.createElement(material_1.Table, null,
                        react_1.default.createElement(material_1.TableHead, null,
                            react_1.default.createElement(material_1.TableRow, null, headers.map(({ key, element }) => (react_1.default.createElement(material_1.TableCell, { key: key }, decorateHeader(element)))))),
                        react_1.default.createElement(material_1.TableBody, null, items.map(item => {
                            const { key, elements } = descriptor.rows(item);
                            return (react_1.default.createElement(StyledRow, { key: key }, elements.map((element, index) => (react_1.default.createElement(material_1.TableCell, { key: headers[index].key }, decorateValue(element))))));
                        }))))),
            react_1.default.createElement(material_1.Box, { sx: {
                    display: {
                        xs: 'block',
                        lg: 'none',
                    },
                } }, items.map(item => {
                const { key, elements } = descriptor.rows(item);
                return (react_1.default.createElement(material_1.Box, { key: key, component: material_1.Paper, sx: {
                        p: 2,
                        mb: 2,
                    } }, elements.map((element, index) => (react_1.default.createElement(material_1.Box, { key: headers[index].key, sx: {
                        mb: 1,
                    } },
                    decorateHeader(headers[index].element),
                    react_1.default.createElement(material_1.Box, { sx: {
                            pl: 2,
                        } }, decorateValue(element)))))));
            }))));
    };
    return TableComponent;
}
exports.createTableComponent = createTableComponent;
exports.default = createTableComponent;
//# sourceMappingURL=TableC.js.map
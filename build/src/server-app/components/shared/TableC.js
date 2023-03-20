"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.createTableComponent = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var styles_1 = require("@mui/material/styles");
var util_1 = require("./util");
var StyledRow = (0, styles_1.styled)(material_1.TableRow)(function (_a) {
    var theme = _a.theme;
    return ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover
        }
    });
});
var decorateHeader = function (element) {
    if (typeof element === 'string') {
        return react_1["default"].createElement(material_1.Typography, { variant: 'subtitle1' }, element);
    }
    return element;
};
var numberFormat = new Intl.NumberFormat();
var decorateValue = function (element) {
    if (element instanceof Date) {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body2' }, (0, util_1.showDate)(element));
    }
    if (typeof element === 'number') {
        return (react_1["default"].createElement(material_1.Typography, { variant: 'body2' }, numberFormat.format(element)));
    }
    if (typeof element === 'string') {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body2' }, element);
    }
    return element;
};
function createTableComponent(descriptor) {
    var TableComponent = function (_a) {
        var items = _a.items;
        if (items.length === 0) {
            return react_1["default"].createElement(material_1.Typography, { variant: 'body1' }, "No items");
        }
        var headers = descriptor.headers;
        return (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: {
                        xs: 'none',
                        lg: 'block'
                    }
                } },
                react_1["default"].createElement(material_1.TableContainer, { component: material_1.Paper },
                    react_1["default"].createElement(material_1.Table, null,
                        react_1["default"].createElement(material_1.TableHead, null,
                            react_1["default"].createElement(material_1.TableRow, null, headers.map(function (_a) {
                                var key = _a.key, element = _a.element;
                                return (react_1["default"].createElement(material_1.TableCell, { key: key }, decorateHeader(element)));
                            }))),
                        react_1["default"].createElement(material_1.TableBody, null, items.map(function (item) {
                            var _a = descriptor.rows(item), key = _a.key, elements = _a.elements;
                            return (react_1["default"].createElement(StyledRow, { key: key }, elements.map(function (element, index) { return (react_1["default"].createElement(material_1.TableCell, { key: headers[index].key }, decorateValue(element))); })));
                        }))))),
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: {
                        xs: 'block',
                        lg: 'none'
                    }
                } }, items.map(function (item) {
                var _a = descriptor.rows(item), key = _a.key, elements = _a.elements;
                return (react_1["default"].createElement(material_1.Box, { key: key, component: material_1.Paper, sx: {
                        p: 2,
                        mb: 2
                    } }, elements.map(function (element, index) { return (react_1["default"].createElement(material_1.Box, { key: headers[index].key, sx: {
                        mb: 1
                    } },
                    decorateHeader(headers[index].element),
                    react_1["default"].createElement(material_1.Box, { sx: {
                            pl: 2
                        } }, decorateValue(element)))); })));
            }))));
    };
    return TableComponent;
}
exports.createTableComponent = createTableComponent;
exports["default"] = createTableComponent;
//# sourceMappingURL=TableC.js.map
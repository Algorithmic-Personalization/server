"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.LayoutC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var Menu_1 = __importDefault(require("@mui/icons-material/Menu"));
var react_router_dom_1 = require("react-router-dom");
var HomeC_1 = __importDefault(require("./HomeC"));
var ParticipantsC_1 = __importDefault(require("./ParticipantsC"));
var ExperimentConfigC_1 = __importDefault(require("./ExperimentConfigC"));
var EventsC_1 = __importDefault(require("./EventsC"));
var NotFoundC_1 = __importDefault(require("./NotFoundC"));
var UserWidgetC_1 = __importDefault(require("./UserWidgetC"));
var navItems = [
    {
        label: 'Home',
        link: '/',
        component: HomeC_1["default"]
    },
    {
        label: 'Participants',
        link: '/participants',
        component: ParticipantsC_1["default"]
    },
    {
        label: 'Experiment Config',
        link: '/experiment-config',
        component: ExperimentConfigC_1["default"]
    },
    {
        label: 'Events',
        link: '/events',
        component: EventsC_1["default"]
    },
];
var LayoutC = function () {
    var _a = __read((0, react_1.useState)(false), 2), drawerOpen = _a[0], setDrawerOpen = _a[1];
    var navigate = (0, react_router_dom_1.useNavigate)();
    var handleDrawerToggle = function () {
        setDrawerOpen(!drawerOpen);
    };
    var drawerWidth = 240;
    var drawer = (react_1["default"].createElement(material_1.Box, { onClick: handleDrawerToggle, sx: { textAlign: 'center' } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h6', sx: { my: 2 } }, "YTDPNL"),
        react_1["default"].createElement(material_1.Divider, null),
        react_1["default"].createElement(material_1.List, null, navItems.map(function (item) { return (react_1["default"].createElement(material_1.ListItem, { key: item.link, disablePadding: true },
            react_1["default"].createElement(material_1.ListItemButton, { sx: { textAlign: 'center' }, onClick: function () {
                    navigate(item.link);
                    setDrawerOpen(false);
                } },
                react_1["default"].createElement(material_1.ListItemText, { primary: item.label })))); }))));
    return (react_1["default"].createElement(material_1.Box, { sx: { display: 'flex' } },
        react_1["default"].createElement(material_1.CssBaseline, null),
        react_1["default"].createElement(material_1.AppBar, { component: 'nav' },
            react_1["default"].createElement(material_1.Toolbar, null,
                react_1["default"].createElement(material_1.IconButton, { color: 'inherit', "aria-label": 'open menu', edge: 'start', onClick: handleDrawerToggle, sx: { mr: 2, display: { sm: 'none' } } },
                    react_1["default"].createElement(Menu_1["default"], null)),
                react_1["default"].createElement(material_1.Typography, { variant: 'h6', component: 'div', sx: {
                        flexGrow: 1,
                        display: { xs: 'none', sm: 'block' }
                    } }, "YTDPNL"),
                react_1["default"].createElement(material_1.Box, { sx: { display: { xs: 'none', sm: 'block' } } },
                    navItems.map(function (item) { return (react_1["default"].createElement(material_1.Button, { onClick: function () {
                            navigate(item.link);
                        }, key: item.link, sx: { color: 'primary.contrastText' } }, item.label)); }),
                    react_1["default"].createElement(material_1.Box, { sx: {
                            display: 'inline-block',
                            ml: 2,
                            color: 'primary.contrastText2'
                        } },
                        react_1["default"].createElement(UserWidgetC_1["default"], null))))),
        react_1["default"].createElement(material_1.Box, { component: 'nav' },
            react_1["default"].createElement(material_1.Drawer, { variant: 'temporary', container: window.document.body, open: drawerOpen, onClose: handleDrawerToggle, ModalProps: {
                    keepMounted: true
                }, sx: {
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
                } }, drawer)),
        react_1["default"].createElement(material_1.Box, { component: 'main', sx: { p: 3, mt: 6, width: '100%' } },
            react_1["default"].createElement(react_router_dom_1.Routes, null,
                navItems.map(function (item) { return (react_1["default"].createElement(react_router_dom_1.Route, { element: react_1["default"].createElement(item.component, null), key: item.link, path: item.link })); }),
                react_1["default"].createElement(react_router_dom_1.Route, { element: react_1["default"].createElement(NotFoundC_1["default"], null), path: '*' })))));
};
exports.LayoutC = LayoutC;
exports["default"] = exports.LayoutC;

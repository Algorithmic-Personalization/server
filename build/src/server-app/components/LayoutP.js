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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const Menu_1 = __importDefault(require("@mui/icons-material/Menu"));
const react_router_dom_1 = require("react-router-dom");
const HomeP_1 = __importDefault(require("./HomeP"));
const ParticipantsP_1 = __importDefault(require("./ParticipantsP"));
const ParticipantOverviewP_1 = __importDefault(require("./ParticipantOverviewP"));
const ExperimentConfigP_1 = __importDefault(require("./ExperimentConfigP"));
const EventsP_1 = __importDefault(require("./EventsP"));
const ApiTokenCreationP_1 = __importDefault(require("./ApiTokenCreationP"));
const NotFoundP_1 = __importDefault(require("./NotFoundP"));
const UserWidgetC_1 = __importDefault(require("./shared/UserWidgetC"));
const MonitoringP_1 = __importDefault(require("./MonitoringP"));
const navItems = [
    {
        label: 'Home',
        link: '/',
        component: HomeP_1.default,
    },
    {
        label: 'Participants',
        link: '/participants',
        component: ParticipantsP_1.default,
    },
    {
        label: 'Experiment Config',
        link: '/experiment-config',
        component: ExperimentConfigP_1.default,
    },
    {
        label: 'Events',
        link: '/events',
        component: EventsP_1.default,
    },
    {
        label: 'API Tokens',
        link: '/tokens',
        component: ApiTokenCreationP_1.default,
    },
    {
        label: 'Monitoring',
        link: '/monitoring',
        component: MonitoringP_1.default,
    },
];
const LayoutC = () => {
    const [drawerOpen, setDrawerOpen] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };
    const drawerWidth = 240;
    const drawer = (react_1.default.createElement(material_1.Box, { onClick: handleDrawerToggle, sx: { textAlign: 'center' } },
        react_1.default.createElement(material_1.Typography, { variant: 'h6', sx: { my: 2 } }, "YTDPNL"),
        react_1.default.createElement(material_1.Divider, null),
        react_1.default.createElement(material_1.List, null, navItems.map(item => (react_1.default.createElement(material_1.ListItem, { key: item.link, disablePadding: true },
            react_1.default.createElement(material_1.ListItemButton, { sx: { textAlign: 'center' }, onClick: () => {
                    navigate(item.link);
                    setDrawerOpen(false);
                } },
                react_1.default.createElement(material_1.ListItemText, { primary: item.label }))))))));
    return (react_1.default.createElement(material_1.Box, { sx: { display: 'flex' } },
        react_1.default.createElement(material_1.CssBaseline, null),
        react_1.default.createElement(material_1.AppBar, { component: 'nav' },
            react_1.default.createElement(material_1.Toolbar, null,
                react_1.default.createElement(material_1.IconButton, { color: 'inherit', "aria-label": 'open menu', edge: 'start', onClick: handleDrawerToggle, sx: { mr: 2, display: { sm: 'none' } } },
                    react_1.default.createElement(Menu_1.default, null)),
                react_1.default.createElement(material_1.Typography, { variant: 'h6', component: 'div', sx: {
                        flexGrow: 1,
                        display: { xs: 'none', sm: 'block' },
                    } }, "YTDPNL"),
                react_1.default.createElement(material_1.Box, { sx: { display: { xs: 'none', sm: 'block' } } },
                    navItems.map(item => (react_1.default.createElement(material_1.Button, { onClick: () => {
                            navigate(item.link);
                        }, key: item.link, sx: { color: 'primary.contrastText' } }, item.label))),
                    react_1.default.createElement(material_1.Box, { sx: {
                            display: 'inline-block',
                            ml: 2,
                            color: 'primary.contrastText2',
                        } },
                        react_1.default.createElement(UserWidgetC_1.default, null))))),
        react_1.default.createElement(material_1.Box, { component: 'nav' },
            react_1.default.createElement(material_1.Drawer, { variant: 'temporary', container: window.document.body, open: drawerOpen, onClose: handleDrawerToggle, ModalProps: {
                    keepMounted: true,
                }, sx: {
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                } }, drawer)),
        react_1.default.createElement(material_1.Box, { component: 'main', sx: { p: 3, mt: 6, width: '100%' } },
            react_1.default.createElement(react_router_dom_1.Routes, null,
                navItems.map(item => (react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(item.component, null), key: item.link, path: item.link }))),
                react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(ParticipantOverviewP_1.default, null), path: '/participants/:code' }),
                react_1.default.createElement(react_router_dom_1.Route, { element: react_1.default.createElement(NotFoundP_1.default, null), path: '*' })))));
};
exports.LayoutC = LayoutC;
exports.default = exports.LayoutC;
//# sourceMappingURL=LayoutP.js.map
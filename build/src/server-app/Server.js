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
exports.Server = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const RequireAuthC_1 = __importDefault(require("./components/shared/RequireAuthC"));
const LayoutP_1 = __importDefault(require("./components/LayoutP"));
const LoginP_1 = __importDefault(require("./components/LoginP"));
const RegisterP_1 = __importDefault(require("./components/RegisterP"));
const ForgotP_1 = __importDefault(require("./components/ForgotP"));
const ResetP_1 = __importDefault(require("./components/ResetP"));
const Server = () => {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    return (react_1.default.createElement(react_router_dom_1.Routes, null,
        react_1.default.createElement(react_router_dom_1.Route, { path: '*', element: react_1.default.createElement(RequireAuthC_1.default, null,
                react_1.default.createElement(LayoutP_1.default, null)) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/login', element: react_1.default.createElement(LoginP_1.default, Object.assign({}, { email, setEmail, password, setPassword })) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/register', element: react_1.default.createElement(RegisterP_1.default, Object.assign({}, { email, setEmail, password, setPassword })) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/forgot', element: react_1.default.createElement(ForgotP_1.default, Object.assign({}, { email, setEmail, password, setPassword })) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/reset-password/:token', element: react_1.default.createElement(ResetP_1.default, Object.assign({}, { email, setEmail, password, setPassword })) })));
};
exports.Server = Server;
exports.default = exports.Server;
//# sourceMappingURL=Server.js.map
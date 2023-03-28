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
exports.LoginModalC = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const material_1 = require("@mui/material");
const LoginP_1 = __importDefault(require("./LoginP"));
const LoginModalC = ({ open, setOpen, onSuccess }) => {
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    console.log('modal says: location', location);
    return (react_1.default.createElement(material_1.Modal, { open: open },
        react_1.default.createElement(material_1.Box, { sx: { bgcolor: 'background.paper', padding: 4 } },
            react_1.default.createElement(material_1.Typography, { sx: { textAlign: 'center' } }, "It seems your session has expired, please log back in."),
            react_1.default.createElement(LoginP_1.default, Object.assign({}, { email, setEmail, password, setPassword }, { onSuccess: () => {
                    setOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                    if (location.state.from) {
                        console.log('redirecting to', location.state.from);
                        navigate(location.state.from);
                    }
                    else {
                        console.log('redirecting to /');
                        navigate('/');
                    }
                }, isModal: true })))));
};
exports.LoginModalC = LoginModalC;
exports.default = exports.LoginModalC;
//# sourceMappingURL=LoginModalP.js.map
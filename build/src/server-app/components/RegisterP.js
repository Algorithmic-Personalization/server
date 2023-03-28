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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const react_router_dom_1 = require("react-router-dom");
const admin_1 = __importDefault(require("../../common/models/admin"));
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const util_1 = require("./shared/util");
const adminApiProvider_1 = require("../adminApiProvider");
const util_2 = require("../../common/util");
const validate = (0, util_2.validateExcept)('id', 'verificationToken');
const RegisterC = ({ email, setEmail, password, setPassword, }) => {
    const [confirm, setConfirm] = (0, react_1.useState)('');
    const [name, setName] = (0, react_1.useState)('');
    const [message, setMessage] = (0, react_1.useState)();
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const api = (0, adminApiProvider_1.useAdminApi)();
    const tryToRegister = () => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const admin = new admin_1.default();
            Object.assign(admin, {
                name,
                email,
                password,
            });
            const validationErrors = yield validate(admin);
            if (password !== confirm) {
                validationErrors.push('Passwords should match');
            }
            if (validationErrors.length > 0) {
                setMessage({
                    text: validationErrors,
                    severity: 'error',
                });
                return;
            }
            setIsSubmitting(true);
            const result = yield api.register(admin);
            setIsSubmitting(false);
            if (result.kind === 'Success') {
                setMessage({
                    text: result.value,
                    severity: 'success',
                });
            }
            else {
                setMessage({
                    text: result.message,
                    severity: 'error',
                });
            }
        }))();
    };
    const ui = (react_1.default.createElement(material_1.Box, { sx: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'top',
            mt: 6,
        } },
        react_1.default.createElement("form", { onSubmit: e => {
                console.log('submit');
                tryToRegister();
                e.preventDefault();
            } },
            react_1.default.createElement("h1", null, "Admin registration"),
            react_1.default.createElement(NotificationsC_1.default, { message: message }),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'name' }, "Name"),
                react_1.default.createElement(material_1.Input, Object.assign({ id: 'name', type: 'text' }, (0, util_1.bind)(name, setName)))),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'email' }, "Email"),
                react_1.default.createElement(material_1.Input, Object.assign({ id: 'email', type: 'email' }, (0, util_1.bind)(email, setEmail)))),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'password' }, "Password"),
                react_1.default.createElement(material_1.Input, Object.assign({ id: 'password', type: 'password' }, (0, util_1.bind)(password, setPassword)))),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'confirm' }, "Password confirmation"),
                react_1.default.createElement(material_1.Input, Object.assign({ id: 'confirm', type: 'password' }, (0, util_1.bind)(confirm, setConfirm)))),
            react_1.default.createElement(material_1.Button, { type: 'submit', variant: 'contained', sx: { mt: 2 }, disabled: isSubmitting }, "Register"),
            react_1.default.createElement(material_1.Box, { sx: { mt: 2 } },
                react_1.default.createElement(react_router_dom_1.Link, { to: '/' }, "Login instead")))));
    return ui;
};
exports.RegisterC = RegisterC;
exports.default = exports.RegisterC;
//# sourceMappingURL=RegisterP.js.map
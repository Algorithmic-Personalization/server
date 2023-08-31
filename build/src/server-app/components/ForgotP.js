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
exports.ForgotP = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const adminApiProvider_1 = require("../adminApiProvider");
const RedirectMessageC_1 = __importDefault(require("./shared/RedirectMessageC"));
const NotificationsC_1 = __importDefault(require("./shared/NotificationsC"));
const util_1 = require("./shared/util");
const ForgotP = ({ email, setEmail, }) => {
    const [message, setMessage] = (0, react_1.useState)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    const sendResetLink = () => __awaiter(void 0, void 0, void 0, function* () {
        if (!email) {
            setMessage({
                text: 'Please enter your email address.',
                severity: 'error',
            });
            return;
        }
        try {
            yield api.sendAdminPasswordResetLink(email);
            setMessage({
                text: 'A password reset link has been sent to your email address if an account is already associated to it. It will be valid for 24 hours.',
                severity: 'success',
            });
        }
        catch (e) {
            setMessage({
                text: 'Something went wrong while attempting to send password reset link, sorry. Pray.',
                severity: 'error',
            });
        }
        return true;
    });
    const ui = (react_1.default.createElement(material_1.Box, { sx: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'top',
            mt: 6,
        } },
        react_1.default.createElement("form", { onSubmit: (e) => __awaiter(void 0, void 0, void 0, function* () {
                e.preventDefault();
                yield sendResetLink();
            }) },
            react_1.default.createElement("h1", null, "Reset your Password"),
            react_1.default.createElement(RedirectMessageC_1.default, null),
            react_1.default.createElement(NotificationsC_1.default, { message: message }),
            react_1.default.createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1.default.createElement(material_1.InputLabel, { htmlFor: 'email' }, "Email"),
                react_1.default.createElement(material_1.Input, Object.assign({ id: 'email', type: 'email' }, (0, util_1.bind)(email, setEmail)))),
            react_1.default.createElement(material_1.Button, { type: 'submit', variant: 'contained', sx: { mt: 2 } }, "Send me a link"))));
    return ui;
};
exports.ForgotP = ForgotP;
exports.default = exports.ForgotP;
//# sourceMappingURL=ForgotP.js.map
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
exports.TokenC = void 0;
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const ContentCopy_1 = __importDefault(require("@mui/icons-material/ContentCopy"));
const adminApiProvider_1 = require("../adminApiProvider");
const NotificationsC_1 = require("./shared/NotificationsC");
const CardC_1 = __importDefault(require("./shared/CardC"));
const ConfirmButtonC = ({ action, label, confirm, sx }) => {
    const [clicked, setClicked] = (0, react_1.useState)(false);
    const confirmText = confirm !== null && confirm !== void 0 ? confirm : 'Are you sure?';
    if (clicked) {
        return (react_1.default.createElement(material_1.Box, { sx: Object.assign(Object.assign({}, sx), { display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }) },
            react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: {
                    mb: 1,
                } }, confirmText),
            react_1.default.createElement(material_1.Box, null,
                react_1.default.createElement(material_1.Button, { variant: 'outlined', color: 'warning', onClick: action, sx: { mr: 1 } }, "Yes"),
                react_1.default.createElement(material_1.Button, { variant: 'outlined', color: 'success', onClick: () => {
                        setClicked(false);
                    } }, "No"))));
    }
    return (react_1.default.createElement(material_1.Button, { sx: sx, variant: 'outlined', color: 'primary', onClick: () => {
            setClicked(true);
        } }, label));
};
const CopyToClipboardC = ({ text }) => {
    const [copied, setCopied] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false);
            }, 5000);
        }
    }, [copied]);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(material_1.Button, { variant: 'contained', sx: {
                mr: 1,
            }, onClick: () => {
                navigator.clipboard.writeText(text).catch(console.error);
                setCopied(true);
            }, endIcon: react_1.default.createElement(ContentCopy_1.default, null) }, "Copy to clipboard"),
        copied && react_1.default.createElement(material_1.Typography, { variant: 'body2' }, "Token copied to clipboard")));
};
const TokenListC = ({ tokens, deleteToken }) => {
    if (!tokens) {
        return react_1.default.createElement(material_1.Typography, { variant: 'body1' }, "Loading...");
    }
    if (tokens.length === 0) {
        return react_1.default.createElement(material_1.Typography, { variant: 'body1' }, "No API tokens created yet");
    }
    return (react_1.default.createElement(material_1.Box, null, tokens.map(token => (react_1.default.createElement(CardC_1.default, { key: token.id, sx: { mb: 2 } },
        react_1.default.createElement(material_1.Typography, { variant: 'body1', sx: { mb: 1 } },
            react_1.default.createElement("strong", null, token.name)),
        react_1.default.createElement(material_1.Typography, { variant: 'body2', sx: {
                mb: 1,
                fontSize: '12px',
                wordBreak: 'break-all',
                userSelect: 'none',
            } }, token.token),
        react_1.default.createElement(material_1.Box, { sx: {
                mt: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                alignItems: { xs: 'stretch', sm: 'center' },
            } },
            react_1.default.createElement(ConfirmButtonC, { action: deleteToken(token.token), label: 'Delete this token', confirm: 'Are you sure you want to delete this token?' }),
            react_1.default.createElement(CopyToClipboardC, { text: token.token })))))));
};
const TokenC = () => {
    const [tokens, setTokens] = (0, react_1.useState)();
    const [name, setName] = (0, react_1.useState)('');
    const [message, setMessage] = (0, react_1.useState)();
    const api = (0, adminApiProvider_1.useAdminApi)();
    (0, react_1.useEffect)(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const tokens = yield api.getApiTokens();
            if (tokens.kind === 'Success') {
                setTokens(tokens.value);
            }
            else {
                setMessage({
                    text: tokens.message,
                    severity: 'error',
                });
            }
        }))();
    }, []);
    const createToken = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = yield api.createApiToken(name);
            if (token.kind === 'Success') {
                setTokens([...(tokens !== null && tokens !== void 0 ? tokens : []), token.value]);
                setMessage({
                    text: 'API token created',
                    severity: 'success',
                });
            }
            else {
                setMessage({
                    text: token.message,
                    severity: 'error',
                });
            }
        }
        catch (error) {
            console.error(error);
            setMessage({
                text: 'Failed to create API token, unexpected error',
                severity: 'error',
            });
        }
    });
    const deleteToken = (token) => () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const res = yield api.deleteApiToken(token);
            if (res.kind === 'Success') {
                setTokens((tokens !== null && tokens !== void 0 ? tokens : []).filter(t => t.token !== token));
                setMessage({
                    text: 'API token deleted',
                    severity: 'warning',
                });
            }
            else {
                setMessage({
                    text: res.message,
                    severity: 'error',
                });
            }
        }
        catch (error) {
            setMessage({
                text: 'Failed to delete API token, unexpected error',
                severity: 'error',
            });
        }
    });
    const ui = (react_1.default.createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1.default.createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "API Tokens"),
        react_1.default.createElement(NotificationsC_1.NotificationsC, { message: message }),
        react_1.default.createElement(material_1.Paper, { sx: { p: 2 } },
            react_1.default.createElement(TokenListC, { tokens: tokens, deleteToken: deleteToken })),
        react_1.default.createElement(material_1.Box, { sx: {
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            } },
            react_1.default.createElement(material_1.TextField, { label: 'Token name', value: name, onChange: event => {
                    setName(event.target.value);
                } }),
            react_1.default.createElement(material_1.Button, { variant: 'contained', color: 'primary', onClick: createToken, sx: { mx: 2 } }, "Create new API token"))));
    return ui;
};
exports.TokenC = TokenC;
exports.default = exports.TokenC;
//# sourceMappingURL=ApiTokenCreationP.js.map
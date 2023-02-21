"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.TokenC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var ContentCopy_1 = __importDefault(require("@mui/icons-material/ContentCopy"));
var adminApiProvider_1 = require("../adminApiProvider");
var NotificationsC_1 = require("./NotificationsC");
var CardC_1 = __importDefault(require("./CardC"));
var ConfirmButtonC = function (_a) {
    var action = _a.action, label = _a.label, confirm = _a.confirm, sx = _a.sx;
    var _b = __read((0, react_1.useState)(false), 2), clicked = _b[0], setClicked = _b[1];
    var confirmText = confirm !== null && confirm !== void 0 ? confirm : 'Are you sure?';
    if (clicked) {
        return (react_1["default"].createElement(material_1.Box, { sx: __assign(__assign({}, sx), { display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }) },
            react_1["default"].createElement(material_1.Typography, { variant: 'body2', sx: {
                    mb: 1
                } }, confirmText),
            react_1["default"].createElement(material_1.Box, null,
                react_1["default"].createElement(material_1.Button, { variant: 'outlined', color: 'warning', onClick: action, sx: { mr: 1 } }, "Yes"),
                react_1["default"].createElement(material_1.Button, { variant: 'outlined', color: 'success', onClick: function () {
                        setClicked(false);
                    } }, "No"))));
    }
    return (react_1["default"].createElement(material_1.Button, { sx: sx, variant: 'outlined', color: 'primary', onClick: function () {
            setClicked(true);
        } }, label));
};
var CopyToClipboardC = function (_a) {
    var text = _a.text;
    var _b = __read((0, react_1.useState)(false), 2), copied = _b[0], setCopied = _b[1];
    (0, react_1.useEffect)(function () {
        if (copied) {
            setTimeout(function () {
                setCopied(false);
            }, 5000);
        }
    }, [copied]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(material_1.Button, { variant: 'contained', sx: {
                mr: 1
            }, onClick: function () {
                navigator.clipboard.writeText(text)["catch"](console.error);
                setCopied(true);
            }, endIcon: react_1["default"].createElement(ContentCopy_1["default"], null) }, "Copy to clipboard"),
        copied && react_1["default"].createElement(material_1.Typography, { variant: 'body2' }, "Token copied to clipboard")));
};
var TokenListC = function (_a) {
    var tokens = _a.tokens, deleteToken = _a.deleteToken;
    if (!tokens) {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body1' }, "Loading...");
    }
    if (tokens.length === 0) {
        return react_1["default"].createElement(material_1.Typography, { variant: 'body1' }, "No API tokens created yet");
    }
    return (react_1["default"].createElement(material_1.Box, null, tokens.map(function (token) { return (react_1["default"].createElement(CardC_1["default"], { key: token.id, sx: { mb: 2 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 1 } },
            react_1["default"].createElement("strong", null, token.name)),
        react_1["default"].createElement(material_1.Typography, { variant: 'body2', sx: {
                mb: 1,
                fontSize: '12px',
                wordBreak: 'break-all',
                userSelect: 'none'
            } }, token.token),
        react_1["default"].createElement(material_1.Box, { sx: {
                mt: 1,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1,
                alignItems: { xs: 'stretch', sm: 'center' }
            } },
            react_1["default"].createElement(ConfirmButtonC, { action: deleteToken(token.token), label: 'Delete this token', confirm: 'Are you sure you want to delete this token?' }),
            react_1["default"].createElement(CopyToClipboardC, { text: token.token })))); })));
};
var TokenC = function () {
    var _a = __read((0, react_1.useState)(), 2), tokens = _a[0], setTokens = _a[1];
    var _b = __read((0, react_1.useState)(''), 2), name = _b[0], setName = _b[1];
    var _c = __read((0, react_1.useState)(), 2), message = _c[0], setMessage = _c[1];
    var api = (0, adminApiProvider_1.useAdminApi)();
    (0, react_1.useEffect)(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.getApiTokens()];
                    case 1:
                        tokens = _a.sent();
                        if (tokens.kind === 'Success') {
                            setTokens(tokens.value);
                        }
                        else {
                            setMessage({
                                text: tokens.message,
                                severity: 'error'
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    }, []);
    var createToken = function () { return __awaiter(void 0, void 0, void 0, function () {
        var token, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.createApiToken(name)];
                case 1:
                    token = _a.sent();
                    if (token.kind === 'Success') {
                        setTokens(__spreadArray(__spreadArray([], __read((tokens !== null && tokens !== void 0 ? tokens : [])), false), [token.value], false));
                        setMessage({
                            text: 'API token created',
                            severity: 'success'
                        });
                    }
                    else {
                        setMessage({
                            text: token.message,
                            severity: 'error'
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    setMessage({
                        text: 'Failed to create API token, unexpected error',
                        severity: 'error'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var deleteToken = function (token) { return function () { return __awaiter(void 0, void 0, void 0, function () {
        var res, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, api.deleteApiToken(token)];
                case 1:
                    res = _a.sent();
                    if (res.kind === 'Success') {
                        setTokens((tokens !== null && tokens !== void 0 ? tokens : []).filter(function (t) { return t.token !== token; }));
                        setMessage({
                            text: 'API token deleted',
                            severity: 'warning'
                        });
                    }
                    else {
                        setMessage({
                            text: res.message,
                            severity: 'error'
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    setMessage({
                        text: 'Failed to delete API token, unexpected error',
                        severity: 'error'
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }; };
    var ui = (react_1["default"].createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "API Tokens"),
        react_1["default"].createElement(NotificationsC_1.NotificationsC, { message: message }),
        react_1["default"].createElement(material_1.Paper, { sx: { p: 2 } },
            react_1["default"].createElement(TokenListC, { tokens: tokens, deleteToken: deleteToken })),
        react_1["default"].createElement(material_1.Box, { sx: {
                mt: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center'
            } },
            react_1["default"].createElement(material_1.TextField, { label: 'Token name', value: name, onChange: function (event) {
                    setName(event.target.value);
                } }),
            react_1["default"].createElement(material_1.Button, { variant: 'contained', color: 'primary', onClick: createToken, sx: { mx: 2 } }, "Create new API token"))));
    return ui;
};
exports.TokenC = TokenC;
exports["default"] = exports.TokenC;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RegisterC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var react_router_dom_1 = require("react-router-dom");
var admin_1 = __importDefault(require("../../common/models/admin"));
var MessageC_1 = __importDefault(require("./MessageC"));
var ErrorsC_1 = __importDefault(require("./ErrorsC"));
var helpers_1 = require("./helpers");
var adminApiProvider_1 = require("../adminApiProvider");
var util_1 = require("../../common/util");
var validate = (0, util_1.validateExcept)('id', 'verificationToken');
var RegisterC = function (_a) {
    var email = _a.email, setEmail = _a.setEmail, password = _a.password, setPassword = _a.setPassword;
    var _b = __read((0, react_1.useState)(''), 2), confirm = _b[0], setConfirm = _b[1];
    var _c = __read((0, react_1.useState)(''), 2), name = _c[0], setName = _c[1];
    var _d = __read((0, react_1.useState)([]), 2), errors = _d[0], setErrors = _d[1];
    var _e = __read((0, react_1.useState)(''), 2), success = _e[0], setSuccess = _e[1];
    var _f = __read((0, react_1.useState)(false), 2), isSubmitting = _f[0], setIsSubmitting = _f[1];
    var api = (0, adminApiProvider_1.useAdminApi)();
    var tryToRegister = function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var admin, validationErrors, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        admin = new admin_1["default"]();
                        Object.assign(admin, {
                            name: name,
                            email: email,
                            password: password
                        });
                        return [4 /*yield*/, validate(admin)];
                    case 1:
                        validationErrors = _a.sent();
                        if (password !== confirm) {
                            validationErrors.push('Passwords should match');
                        }
                        if (validationErrors.length > 0) {
                            setErrors(validationErrors);
                            return [2 /*return*/];
                        }
                        setErrors([]);
                        setIsSubmitting(true);
                        return [4 /*yield*/, api.register(admin)];
                    case 2:
                        result = _a.sent();
                        setIsSubmitting(false);
                        if (result.kind === 'Success') {
                            setSuccess(result.value);
                        }
                        else {
                            setErrors([result.message]);
                        }
                        return [2 /*return*/];
                }
            });
        }); })();
    };
    var ui = (react_1["default"].createElement(material_1.Box, { sx: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'top',
            mt: 6
        } },
        react_1["default"].createElement("form", { onSubmit: function (e) {
                console.log('submit');
                tryToRegister();
                e.preventDefault();
            } },
            react_1["default"].createElement("h1", null, "Admin registration"),
            react_1["default"].createElement(ErrorsC_1["default"], { errors: errors }),
            react_1["default"].createElement(MessageC_1["default"], { message: success, type: 'success' }),
            react_1["default"].createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1["default"].createElement(material_1.InputLabel, { htmlFor: 'name' }, "Name"),
                react_1["default"].createElement(material_1.Input, __assign({ id: 'name', type: 'text' }, (0, helpers_1.bind)(name, setName)))),
            react_1["default"].createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1["default"].createElement(material_1.InputLabel, { htmlFor: 'email' }, "Email"),
                react_1["default"].createElement(material_1.Input, __assign({ id: 'email', type: 'email' }, (0, helpers_1.bind)(email, setEmail)))),
            react_1["default"].createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1["default"].createElement(material_1.InputLabel, { htmlFor: 'password' }, "Password"),
                react_1["default"].createElement(material_1.Input, __assign({ id: 'password', type: 'password' }, (0, helpers_1.bind)(password, setPassword)))),
            react_1["default"].createElement(material_1.FormControl, { sx: { mb: 2, display: 'block' } },
                react_1["default"].createElement(material_1.InputLabel, { htmlFor: 'confirm' }, "Password confirmation"),
                react_1["default"].createElement(material_1.Input, __assign({ id: 'confirm', type: 'password' }, (0, helpers_1.bind)(confirm, setConfirm)))),
            react_1["default"].createElement(material_1.Button, { type: 'submit', variant: 'contained', sx: { mt: 2 }, disabled: isSubmitting }, "Register"),
            react_1["default"].createElement(material_1.Box, { sx: { mt: 2 } },
                react_1["default"].createElement(react_router_dom_1.Link, { to: '/' }, "Login instead")))));
    return ui;
};
exports.RegisterC = RegisterC;
exports["default"] = exports.RegisterC;

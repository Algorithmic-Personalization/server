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
exports.LoginModalC = void 0;
var react_1 = __importStar(require("react"));
var material_1 = require("@mui/material");
var LoginC_1 = __importDefault(require("./LoginC"));
var LoginModalC = function (_a) {
    var open = _a.open, setOpen = _a.setOpen, onSuccess = _a.onSuccess;
    var _b = __read((0, react_1.useState)(''), 2), email = _b[0], setEmail = _b[1];
    var _c = __read((0, react_1.useState)(''), 2), password = _c[0], setPassword = _c[1];
    return (react_1["default"].createElement(material_1.Modal, { open: open },
        react_1["default"].createElement(material_1.Box, { sx: { bgcolor: 'background.paper', padding: 4 } },
            react_1["default"].createElement(material_1.Typography, { sx: { textAlign: 'center' } }, "It seems your session has expired, please log back in."),
            react_1["default"].createElement(LoginC_1["default"], __assign({}, { email: email, setEmail: setEmail, password: password, setPassword: setPassword }, { onSuccess: function () {
                    setOpen(false);
                    if (onSuccess) {
                        onSuccess();
                    }
                }, isModal: true })))));
};
exports.LoginModalC = LoginModalC;
exports["default"] = exports.LoginModalC;

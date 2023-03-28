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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
var react_1 = __importStar(require("react"));
var react_router_dom_1 = require("react-router-dom");
var RequireAuthC_1 = __importDefault(require("./components/shared/RequireAuthC"));
var LoginP_1 = __importDefault(require("./components/LoginP"));
var RegisterP_1 = __importDefault(require("./components/RegisterP"));
var LayoutP_1 = __importDefault(require("./components/LayoutP"));
var Server = function () {
    var _a = __read((0, react_1.useState)(''), 2), email = _a[0], setEmail = _a[1];
    var _b = __read((0, react_1.useState)(''), 2), password = _b[0], setPassword = _b[1];
    return (react_1.default.createElement(react_router_dom_1.Routes, null,
        react_1.default.createElement(react_router_dom_1.Route, { path: '*', element: react_1.default.createElement(RequireAuthC_1.default, null,
                react_1.default.createElement(LayoutP_1.default, null)) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/login', element: react_1.default.createElement(LoginP_1.default, __assign({}, { email: email, setEmail: setEmail, password: password, setPassword: setPassword })) }),
        react_1.default.createElement(react_router_dom_1.Route, { path: '/register', element: react_1.default.createElement(RegisterP_1.default, __assign({}, { email: email, setEmail: setEmail, password: password, setPassword: setPassword })) })));
};
exports.Server = Server;
exports.default = exports.Server;
//# sourceMappingURL=Server.js.map
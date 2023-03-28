"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireAuthC = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const adminApiProvider_1 = require("../../adminApiProvider");
const RequireAuthC = ({ children }) => {
    const api = (0, adminApiProvider_1.useAdminApi)();
    const location = (0, react_router_dom_1.useLocation)();
    if (!api.isLoggedIn()) {
        console.log('not logged in, redirecting to /login');
        console.log('should redirect to', location, 'after login');
        return react_1.default.createElement(react_router_dom_1.Navigate, { to: '/login', state: { from: location }, replace: true });
    }
    return react_1.default.createElement(react_1.default.Fragment, null, children);
};
exports.RequireAuthC = RequireAuthC;
exports.default = exports.RequireAuthC;
//# sourceMappingURL=RequireAuthC.js.map
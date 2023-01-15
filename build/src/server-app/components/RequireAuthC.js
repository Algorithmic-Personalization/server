"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RequireAuthC = void 0;
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var adminApiProvider_1 = require("../adminApiProvider");
var RequireAuthC = function (_a) {
    var children = _a.children;
    var api = (0, adminApiProvider_1.useAdminApi)();
    var location = (0, react_router_dom_1.useLocation)();
    if (!api.isLoggedIn() && !api.wasLoggedIn) {
        console.log('not logged in, redirecting to /login');
        return react_1["default"].createElement(react_router_dom_1.Navigate, { to: '/login', state: { from: location }, replace: true });
    }
    return react_1["default"].createElement(react_1["default"].Fragment, null, children);
};
exports.RequireAuthC = RequireAuthC;
exports["default"] = exports.RequireAuthC;

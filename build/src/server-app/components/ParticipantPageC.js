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
exports.__esModule = true;
exports.ParticipantPageC = void 0;
var react_1 = __importStar(require("react"));
var react_router_1 = require("react-router");
var material_1 = require("@mui/material");
var adminApiProvider_1 = require("../adminApiProvider");
var OverviewC = function (_a) {
    var data = _a.data;
    var ui = (react_1["default"].createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } }, "Basic info"),
        react_1["default"].createElement(material_1.Typography, { variant: 'body1', sx: { mb: 2 } },
            "Email: ",
            data.email)));
    return ui;
};
var ParticipantPageC = function () {
    var email = (0, react_router_1.useParams)().email;
    var api = (0, adminApiProvider_1.useAdminApi)();
    var _a = __read((0, react_1.useState)(undefined), 2), overview = _a[0], setOverview = _a[1];
    (0, react_1.useEffect)(function () {
        if (!email) {
            console.error('No email provided');
            return;
        }
        api.getParticipantOverview(email).then(function (res) {
            if (res.kind === 'Success') {
                setOverview(res.value);
            }
        })["catch"](function (err) {
            console.error(err);
        });
    }, [email]);
    var ui = (react_1["default"].createElement(material_1.Box, { component: 'section', sx: { mb: 4 } },
        react_1["default"].createElement(material_1.Typography, { variant: 'h2', sx: { mb: 2 } },
            "Participant: ",
            email),
        overview === undefined ? 'Loading...' : react_1["default"].createElement(OverviewC, { data: overview })));
    return ui;
};
exports.ParticipantPageC = ParticipantPageC;
exports["default"] = exports.ParticipantPageC;

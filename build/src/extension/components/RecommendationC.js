"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RecommendationC = void 0;
var react_1 = __importDefault(require("react"));
var material_1 = require("@mui/material");
var RecommendationC = function (_a) {
    var handleRecommendationClicked = _a.handleRecommendationClicked, rec = __rest(_a, ["handleRecommendationClicked"]);
    return (react_1["default"].createElement("div", { onClick: handleRecommendationClicked },
        react_1["default"].createElement("a", { href: rec.url },
            react_1["default"].createElement(material_1.Box, { sx: {
                    display: 'flex'
                } },
                react_1["default"].createElement(material_1.Box, { sx: { mr: 2 } },
                    react_1["default"].createElement(material_1.Box, { component: 'img', alt: rec.title, className: 'yt-core-image--fill-parent-height yt-core-image--fill-parent-width yt-core-image yt-core-image--content-mode-scale-aspect-fill yt-core-image--loaded', src: rec.miniatureUrl, sx: {
                            width: 168,
                            height: 94
                        } })),
                react_1["default"].createElement(material_1.Box, null,
                    react_1["default"].createElement(material_1.Typography, { variant: 'body2', component: 'span' }, rec.title))))));
};
exports.RecommendationC = RecommendationC;
exports["default"] = exports.RecommendationC;

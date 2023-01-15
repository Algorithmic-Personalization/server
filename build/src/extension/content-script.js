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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var react_1 = __importDefault(require("react"));
var client_1 = require("react-dom/client");
var material_1 = require("@mui/material");
var lib_1 = require("./lib");
var App_1 = __importDefault(require("./App"));
var theme_1 = __importDefault(require("./theme"));
var apiProvider_1 = require("./apiProvider");
var event_1 = __importStar(require("../server/models/event"));
var root;
var previousUrl;
if (apiProvider_1.defaultApi.getSession() === undefined) {
    apiProvider_1.defaultApi.newSession()["catch"](console.error);
}
var observer = new MutationObserver(function () {
    if (window.location.href !== previousUrl) {
        previousUrl = window.location.href;
        var event_2 = new event_1["default"]();
        event_2.type = event_1.EventType.PAGE_VIEW;
        event_2.url = window.location.href;
        apiProvider_1.defaultApi.postEvent(event_2, true)["catch"](console.error);
    }
    if (!(0, lib_1.isOnVideoPage)()) {
        return;
    }
    var related = document.querySelector('#related');
    if (!related) {
        return;
    }
    var relatedElt = related;
    if (relatedElt.style.display === 'none') {
        return;
    }
    if (!relatedElt.parentElement) {
        return;
    }
    relatedElt.style.display = 'none';
    if (!root) {
        root = document.createElement('div');
        (0, client_1.createRoot)(root).render((react_1["default"].createElement(react_1["default"].StrictMode, null,
            react_1["default"].createElement(material_1.ThemeProvider, { theme: theme_1["default"] },
                react_1["default"].createElement(apiProvider_1.apiProvider, { value: apiProvider_1.defaultApi },
                    react_1["default"].createElement(App_1["default"], null))))));
    }
    relatedElt.parentElement.appendChild(root);
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

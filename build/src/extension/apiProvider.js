"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.useApi = exports.apiProvider = exports.apiContext = exports.defaultApi = void 0;
var react_1 = __importDefault(require("react"));
var api_1 = require("./api");
var util_1 = require("../util");
var config_extension_1 = __importDefault(require("../../config.extension"));
var env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
console.log('NODE_ENV:', process.env.NODE_ENV);
if (!(0, util_1.has)("".concat(env, "-server-url"))(config_extension_1["default"])) {
    throw new Error("Missing ".concat(env, "-server-url in config.extension.ts"));
}
var serverUrl = config_extension_1["default"]["".concat(env, "-server-url")];
console.log('API URL:', serverUrl);
exports.defaultApi = (0, api_1.createApi)(serverUrl);
exports.apiContext = react_1["default"].createContext(exports.defaultApi);
exports.apiProvider = exports.apiContext.Provider;
var useApi = function () { return react_1["default"].useContext(exports.apiContext); };
exports.useApi = useApi;
exports["default"] = exports.apiProvider;

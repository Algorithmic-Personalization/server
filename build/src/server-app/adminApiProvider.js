"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAdminApi = exports.adminApiProvider = exports.adminApiContext = exports.defaultAdminApi = exports.serverUrl = void 0;
var react_1 = __importDefault(require("react"));
var adminApi_1 = require("./adminApi");
var util_1 = require("../common/util");
var config_extension_1 = __importDefault(require("../../config.extension"));
var env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
if (!(0, util_1.has)("".concat(env, "-server-url"))(config_extension_1.default)) {
    throw new Error("Missing ".concat(env, "-server-url in config.extension.ts"));
}
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API URL:', config_extension_1.default["".concat(env, "-server-url")]);
exports.serverUrl = config_extension_1.default["".concat(env, "-server-url")];
exports.defaultAdminApi = (0, adminApi_1.createAdminApi)(exports.serverUrl);
exports.adminApiContext = react_1.default.createContext(exports.defaultAdminApi);
exports.adminApiProvider = exports.adminApiContext.Provider;
var useAdminApi = function () { return react_1.default.useContext(exports.adminApiContext); };
exports.useAdminApi = useAdminApi;
exports.default = exports.adminApiProvider;
//# sourceMappingURL=adminApiProvider.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverUrl = void 0;
const util_1 = require("../../../common/util");
const config_extension_1 = __importDefault(require("../../../../config.extension"));
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
if (!(0, util_1.has)(`${env}-server-url`)(config_extension_1.default)) {
    throw new Error(`Missing ${env}-server-url in config`);
}
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('API URL:', config_extension_1.default[`${env}-server-url`]);
exports.serverUrl = config_extension_1.default[`${env}-server-url`];
exports.default = exports.serverUrl;
//# sourceMappingURL=serverUrl.js.map
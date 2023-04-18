"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledEventConfig = void 0;
const util_1 = require("../../../common/util");
const ensureRecord_1 = __importDefault(require("./ensureRecord"));
const getInstalledEventConfig = (conf) => {
    (0, ensureRecord_1.default)(conf);
    if (!(0, util_1.has)('installed-event')(conf) || typeof conf['installed-event'] !== 'object') {
        throw new Error('Missing or invalid installed-event config key in config.yaml');
    }
    const installedEvent = conf['installed-event'];
    if (!(0, util_1.has)('url')(installedEvent) || typeof installedEvent.url !== 'string') {
        throw new Error('Missing or invalid url key in installed-event config');
    }
    if (!(0, util_1.has)('token')(installedEvent) || typeof installedEvent.token !== 'string') {
        throw new Error('Missing or invalid token key in installed-event config');
    }
    return {
        url: installedEvent.url,
        token: installedEvent.token,
    };
};
exports.getInstalledEventConfig = getInstalledEventConfig;
exports.default = exports.getInstalledEventConfig;
//# sourceMappingURL=getInstalledEventConfig.js.map
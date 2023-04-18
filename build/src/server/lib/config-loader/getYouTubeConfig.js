"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeConfig = void 0;
const util_1 = require("../../../common/util");
const ensureRecord_1 = __importDefault(require("./ensureRecord"));
const getYouTubeConfig = (conf) => {
    (0, ensureRecord_1.default)(conf);
    if (!(0, util_1.has)('YouTube')(conf) || typeof conf.YouTube !== 'object' || conf.YouTube === null) {
        throw new Error('Missing or invalid youtube config key in config.yaml');
    }
    if (!(0, util_1.has)('api-key')(conf.YouTube) || typeof conf.YouTube['api-key'] !== 'string') {
        throw new Error('Missing or invalid key key in youtube config');
    }
    const { 'api-key': key } = conf.YouTube;
    if (typeof key !== 'string') {
        throw new Error('Missing or invalid key key in youtube config');
    }
    return {
        videosEndPoint: 'https://youtube.googleapis.com/youtube/v3/videos',
        categoriesEndPoint: 'https://youtube.googleapis.com/youtube/v3/videoCategories',
        apiKey: key,
    };
};
exports.getYouTubeConfig = getYouTubeConfig;
exports.default = exports.getYouTubeConfig;
//# sourceMappingURL=getYouTubeConfig.js.map
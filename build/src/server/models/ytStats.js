"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YtStats = void 0;
const model_1 = __importDefault(require("../../common/lib/model"));
class YtStats extends model_1.default {
    constructor() {
        super(...arguments);
        this.metadataRequestTimeMs = 0;
        this.failRate = 0;
        this.dbHitRate = 0;
        this.cacheHitRate = 0;
        this.cacheMemSizeBytes = 0;
        this.cacheMemSizeString = '';
        this.cachedEntries = 0;
        this.hitRate = 0;
        this.overAllCacheHitRate = 0;
    }
}
exports.YtStats = YtStats;
exports.default = YtStats;
//# sourceMappingURL=ytStats.js.map
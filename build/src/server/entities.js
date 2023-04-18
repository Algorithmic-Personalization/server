"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entities = void 0;
const admin_1 = __importDefault(require("../common/models/admin"));
const token_1 = __importDefault(require("./models/token"));
const participant_1 = __importDefault(require("./models/participant"));
const experimentConfig_1 = __importDefault(require("../common/models/experimentConfig"));
const session_1 = __importDefault(require("../common/models/session"));
const event_1 = __importDefault(require("../common/models/event"));
const video_1 = __importDefault(require("./models/video"));
const watchTime_1 = __importDefault(require("./models/watchTime"));
const videoListItem_1 = __importDefault(require("./models/videoListItem"));
const dailyActivityTime_1 = __importDefault(require("./models/dailyActivityTime"));
const transitionEvent_1 = __importDefault(require("./models/transitionEvent"));
const transitionSetting_1 = __importDefault(require("./models/transitionSetting"));
const videoMetadata_1 = __importDefault(require("./models/videoMetadata"));
const videoCategory_1 = __importDefault(require("./models/videoCategory"));
const youTubeRequestLatency_1 = __importDefault(require("./models/youTubeRequestLatency"));
const requestLog_1 = __importDefault(require("./models/requestLog"));
// Add classes used by typeorm as models here
// so that typeorm can extract the metadata from them.
exports.entities = [
    admin_1.default,
    token_1.default,
    participant_1.default,
    experimentConfig_1.default,
    session_1.default,
    event_1.default,
    video_1.default,
    videoListItem_1.default,
    watchTime_1.default,
    dailyActivityTime_1.default,
    transitionEvent_1.default,
    transitionSetting_1.default,
    videoMetadata_1.default,
    videoCategory_1.default,
    youTubeRequestLatency_1.default,
    requestLog_1.default,
];
exports.default = exports.entities;
//# sourceMappingURL=entities.js.map
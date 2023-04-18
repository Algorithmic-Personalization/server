"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoreWatchTime = void 0;
const watchTime_1 = __importDefault(require("../../models/watchTime"));
const util_1 = require("../../../common/util");
const createStoreWatchTime = ({ dataSource, log }) => (event) => __awaiter(void 0, void 0, void 0, function* () {
    const eventRepo = dataSource.getRepository(watchTime_1.default);
    const watchTime = new watchTime_1.default();
    watchTime.eventId = event.id;
    watchTime.secondsWatched = event.secondsWatched;
    try {
        yield (0, util_1.validateNew)(watchTime);
        yield eventRepo.save(watchTime);
    }
    catch (err) {
        log('Error storing watch time event meta-data', err);
    }
});
exports.createStoreWatchTime = createStoreWatchTime;
exports.default = exports.createStoreWatchTime;
//# sourceMappingURL=storeWatchTime.js.map
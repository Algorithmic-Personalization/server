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
exports.cleanVideoIds = exports.cleanId = void 0;
const typeorm_1 = require("typeorm");
const video_1 = __importDefault(require("../models/video"));
const cleanId = (id) => {
    const [res] = id.split('&');
    return res;
};
exports.cleanId = cleanId;
const cleanVideoIds = (dataSource, log) => __awaiter(void 0, void 0, void 0, function* () {
    const repo = dataSource.getRepository(video_1.default);
    const initialYouTubeIds = [];
    const problematicVideos = yield repo
        .find({
        where: {
            youtubeId: (0, typeorm_1.Like)('%&%'),
            metadataAvailable: (0, typeorm_1.IsNull)(),
        },
    });
    const problematicYtIds = [];
    problematicVideos.forEach(video => {
        problematicYtIds.push(video.youtubeId);
        initialYouTubeIds.push(video.youtubeId);
        video.youtubeId = (0, exports.cleanId)(video.youtubeId);
    });
    log('info', 'cleaning up', problematicVideos.length, 'video ids');
    const promises = problematicVideos.map((video) => __awaiter(void 0, void 0, void 0, function* () { return repo.save(video); }));
    const res = yield Promise.allSettled(promises);
    const count = res.filter(({ status }, i) => {
        const ok = status === 'fulfilled';
        if (ok) {
            return true;
        }
        repo
            .createQueryBuilder()
            .update(video_1.default)
            .set({
            metadataAvailable: false,
        })
            .where({
            id: problematicVideos[i].id,
        })
            .execute()
            .then(() => {
            log('info', 'set metadata_available to false for', `"${problematicYtIds[i]}"`, 'in order not to attempt scraping it again');
        })
            .catch(err => {
            log('error', 'failed to set metadata_available to false for', `"${problematicYtIds[i]}"`, '(in order not to attempt scraping it again)', err);
        });
        return false;
    }).length;
    log('info', 'cleaned', count, 'video ids');
    log('info', 'failed to clean', res.length - count, 'video ids');
    return count;
});
exports.cleanVideoIds = cleanVideoIds;
exports.default = exports.cleanVideoIds;
//# sourceMappingURL=cleanVideoIds.js.map
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
exports.storeVideos = exports._storeVideos = exports.makeVideosFromRecommendations = void 0;
const video_1 = __importDefault(require("../../models/video"));
const util_1 = require("../../../common/util");
const cleanVideoIds_1 = require("../cleanVideoIds");
const makeVideosFromRecommendations = (recommendations) => recommendations.map(r => {
    const v = new video_1.default();
    v.youtubeId = (0, cleanVideoIds_1.cleanId)(r.videoId);
    v.title = r.title;
    v.url = r.url;
    return v;
});
exports.makeVideosFromRecommendations = makeVideosFromRecommendations;
const _storeVideos = (repo, videos) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = yield Promise.all(videos.map(util_1.validateNew));
    const pairs = videos.map((v, i) => ({ v, e: validationErrors[i] })).filter(({ e }) => e.length > 0);
    if (pairs.length > 0) {
        throw new Error(`Validation errors: ${pairs.map(({ v, e }) => `(video ${v.youtubeId}: ${e.join(', ')})`).join(', ')}.`);
    }
    const sanitized = videos.map(v => (Object.assign(Object.assign({}, v), { id: 0 })));
    const ids = [];
    for (const video of sanitized) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const res = yield repo.save(video);
            ids.push(res.id);
        }
        catch (e) {
            // eslint-disable-next-line no-await-in-loop
            const v = yield repo.findOneBy({
                youtubeId: video.youtubeId,
            });
            if (v) {
                ids.push(v.id);
            }
            else {
                throw e;
            }
        }
    }
    return ids;
});
exports._storeVideos = _storeVideos;
const storeVideos = (repo, videos) => __awaiter(void 0, void 0, void 0, function* () {
    const validationErrors = yield Promise.all(videos.map(util_1.validateNew));
    const pairs = videos.map((v, i) => ({ v, e: validationErrors[i] })).filter(({ e }) => e.length > 0);
    if (pairs.length > 0) {
        throw new Error(`Validation errors: ${pairs.map(({ v, e }) => `(video ${v.youtubeId}: ${e.join(', ')})`).join(', ')}.`);
    }
    const sanitized = videos.map(v => (Object.assign(Object.assign({}, v), { id: 0 })));
    const ytIdMap = new Map();
    const insertPromises = [];
    const readPromises = [];
    for (const video of sanitized) {
        insertPromises.push(repo.save(video));
    }
    const res = yield Promise.allSettled(insertPromises);
    res.forEach((r, i) => {
        if (r.status === 'fulfilled') {
            ytIdMap.set(sanitized[i].youtubeId, r.value.id);
        }
        else {
            readPromises.push(repo.findOneBy({
                youtubeId: sanitized[i].youtubeId,
            }).then(v => {
                if (v) {
                    ytIdMap.set(sanitized[i].youtubeId, v.id);
                    return v;
                }
                throw new Error(`Could not find video with youtubeId ${sanitized[i].youtubeId}`);
            }));
        }
    });
    yield Promise.all(readPromises);
    return videos.map(v => {
        const id = ytIdMap.get(v.youtubeId);
        if (id === undefined) {
            throw new Error(`Could not find video with youtubeId ${v.youtubeId}`);
        }
        return id;
    });
});
exports.storeVideos = storeVideos;
//# sourceMappingURL=storeVideos.js.map
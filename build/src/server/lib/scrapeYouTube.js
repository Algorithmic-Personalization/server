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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Limiter_waitDelays, _Limiter_waitIndex;
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrape = void 0;
const video_1 = __importDefault(require("../models/video"));
const util_1 = require("../../util");
const oneDayRetryDelay = 1000 * 60 * 60 * 24;
class Limiter {
    constructor(log) {
        this.log = log;
        _Limiter_waitDelays.set(this, [500, 500, 500, 1000, 1000, 2000, 5000, 10000, 10000]);
        _Limiter_waitIndex.set(this, 0);
    }
    shouldGiveUp(callWasSuccessful) {
        var _a, _b;
        if (callWasSuccessful) {
            if (__classPrivateFieldGet(this, _Limiter_waitIndex, "f") > 0) {
                __classPrivateFieldSet(this, _Limiter_waitIndex, (_a = __classPrivateFieldGet(this, _Limiter_waitIndex, "f"), --_a), "f");
                this.log('info', 'querying a bit faster because latest call was successful, now waiting', this.getDelay(), 'ms');
            }
            return false;
        }
        __classPrivateFieldSet(this, _Limiter_waitIndex, (_b = __classPrivateFieldGet(this, _Limiter_waitIndex, "f"), ++_b), "f");
        this.log('warning', 'latest call was not successful, waiting for', this.getDelay(), 'ms for a bit');
        const giveUp = __classPrivateFieldGet(this, _Limiter_waitIndex, "f") === __classPrivateFieldGet(this, _Limiter_waitDelays, "f").length;
        if (giveUp) {
            this.log('error', 'giving scraping, too many consecutive failures');
        }
        return giveUp;
    }
    getDelay() {
        return __classPrivateFieldGet(this, _Limiter_waitDelays, "f")[Math.min(__classPrivateFieldGet(this, _Limiter_waitDelays, "f").length - 1, __classPrivateFieldGet(this, _Limiter_waitIndex, "f"))];
    }
}
_Limiter_waitDelays = new WeakMap(), _Limiter_waitIndex = new WeakMap();
const _scrape = (dataSource, log, api) => __awaiter(void 0, void 0, void 0, function* () {
    const show = (0, util_1.showSql)(log);
    const videoCount = yield dataSource.getRepository(video_1.default).count();
    log('info', 'there are currently', videoCount, 'videos in the database');
    const { heapUsed } = process.memoryUsage();
    const videos = (yield show(dataSource.createQueryBuilder()
        .select('distinct(v.youtube_id)', 'youtube_id')
        .from(video_1.default, 'v')
        .leftJoin('video_metadata', 'vm', 'v.youtube_id = vm.youtube_id')
        .where('vm.youtube_id is null')
        .andWhere('v.metadata_available is null')).getRawMany()).map(({ youtube_id }) => youtube_id);
    const { heapUsed: heapUsedAfter } = process.memoryUsage();
    log('info', 'among which', videos.length, 'are without metadata');
    log('info', 'that is,', (0, util_1.formatPct)((0, util_1.pct)(videos.length, videoCount)), 'of all videos');
    log('info', 'memory used to get the list:', (0, util_1.formatSize)(heapUsedAfter - heapUsed));
    const batchSize = 50;
    const limiter = new Limiter(log);
    let scrapeCount = 0;
    while (videos.length) {
        const batch = videos.splice(0, batchSize);
        try {
            // eslint-disable-next-line no-await-in-loop
            const _a = yield api.getMetaFromVideoIds(batch), { data } = _a, stats = __rest(_a, ["data"]);
            log('info', 'yt batch scrape result:', stats);
            scrapeCount += data.size;
            const callWasSuccessful = data.size > 0;
            if (!callWasSuccessful) {
                log('warning', 'yt batch scrape result was not entirely successful, only got', data.size, 'videos out of', batch.length);
            }
            if (limiter.shouldGiveUp(callWasSuccessful)) {
                log('error', 'giving up scraping YT API for now, too many consecutive failures');
                break;
            }
        }
        catch (err) {
            log('error', 'yt batch scrape failed', err);
            break;
        }
        // eslint-disable-next-line no-await-in-loop
        yield (0, util_1.sleep)(limiter.getDelay());
    }
    log('successfully', 'scraped', scrapeCount, 'videos from yt API');
    return scrapeCount;
});
const scrape = (dataSource, log, api) => __awaiter(void 0, void 0, void 0, function* () {
    if (!api.hasDataSource()) {
        log('error', 'no data source provided to YT API, skipping scrape');
        return;
    }
    for (;;) {
        log('info', 'starting yt API scrape');
        // eslint-disable-next-line no-await-in-loop
        yield _scrape(dataSource, log, api);
        log('info', 'yt API scrape finished, waiting', oneDayRetryDelay, 'ms before next scrape');
        // eslint-disable-next-line no-await-in-loop
        yield (0, util_1.sleep)(oneDayRetryDelay);
    }
});
exports.scrape = scrape;
exports.default = exports.scrape;
//# sourceMappingURL=scrapeYouTube.js.map
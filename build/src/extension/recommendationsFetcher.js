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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.fetchDefaultRecommendations = exports.fetchNonPersonalizedRecommendations = exports.fetchRecommendations = void 0;
var util_1 = require("../util");
var getDataContainingList = function (results, useCredentials) {
    if (!useCredentials) {
        return results;
    }
    if (!Array.isArray(results)) {
        throw new Error('results is not an array');
    }
    var container = results.find((0, util_1.has)('itemSectionRenderer'));
    if (!(0, util_1.has)('itemSectionRenderer')(container)) {
        throw new Error('Could not find itemSectionRenderer in container');
    }
    var itemSectionRenderer = container.itemSectionRenderer;
    if (!(0, util_1.has)('contents')(itemSectionRenderer)) {
        throw new Error('Could not find contents in itemSectionRenderer');
    }
    var contents = itemSectionRenderer.contents;
    if (!Array.isArray(contents)) {
        throw new Error('Could not find contents in itemSectionRenderer or it is not an array');
    }
    return contents;
};
var fetchRecommendations = function (videoUrl, useCredentials) { return __awaiter(void 0, void 0, void 0, function () {
    var html, parser, doc, scripts, initialDataScript, jsonText, initialData, contents, twoColumnWatchNextResults, secondaryResults, secondaryResults2, results, dataContainingList, recommendations;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, fetch(videoUrl, {
                    credentials: useCredentials ? 'include' : 'omit'
                })];
            case 1: return [4 /*yield*/, (_b.sent()).text()];
            case 2:
                html = _b.sent();
                parser = new DOMParser();
                doc = parser.parseFromString(html, 'text/html');
                scripts = Array.from(doc.querySelectorAll('script'));
                initialDataScript = scripts.find(function (script) {
                    var textContent = script.textContent;
                    if (textContent) {
                        return textContent.trimStart().startsWith('var ytInitialData = ');
                    }
                    return false;
                });
                if (!initialDataScript) {
                    throw new Error('Could not find initial data script');
                }
                jsonText = (_a = initialDataScript.textContent) === null || _a === void 0 ? void 0 : _a.replace('var ytInitialData = ', '').replace(/;$/, '').trim();
                if (!jsonText) {
                    throw new Error('Could not parse initial data');
                }
                initialData = JSON.parse(jsonText);
                contents = initialData.contents;
                if (typeof contents !== 'object' || !contents) {
                    throw new Error('Could not find contents in initial data');
                }
                if (!(0, util_1.has)('twoColumnWatchNextResults')(contents)) {
                    throw new Error('Could not find twoColumnWatchNextResults in contents');
                }
                twoColumnWatchNextResults = contents.twoColumnWatchNextResults;
                if (typeof twoColumnWatchNextResults !== 'object' || !twoColumnWatchNextResults) {
                    throw new Error('Could not find twoColumnWatchNextResults in contents');
                }
                if (!(0, util_1.has)('secondaryResults')(twoColumnWatchNextResults)) {
                    throw new Error('Could not find secondaryResults in twoColumnWatchNextResults');
                }
                secondaryResults = twoColumnWatchNextResults.secondaryResults;
                if (typeof secondaryResults !== 'object' || !secondaryResults) {
                    throw new Error('Could not find secondaryResults in twoColumnWatchNextResults');
                }
                if (!(0, util_1.has)('secondaryResults')(secondaryResults)) {
                    throw new Error('Could not find secondaryResults in secondaryResults');
                }
                secondaryResults2 = secondaryResults.secondaryResults;
                if (typeof secondaryResults2 !== 'object' || !secondaryResults2) {
                    throw new Error('Could not find secondaryResults in secondaryResults');
                }
                if (!(0, util_1.has)('results')(secondaryResults2)) {
                    throw new Error('Could not find results in secondaryResults');
                }
                results = secondaryResults2.results;
                if (!Array.isArray(results)) {
                    throw new Error('Could not find results in secondaryResults');
                }
                dataContainingList = getDataContainingList(results, useCredentials);
                recommendations = dataContainingList.map(function (result) {
                    if (!(0, util_1.has)('compactVideoRenderer')(result)) {
                        return undefined;
                    }
                    var r = result.compactVideoRenderer;
                    if (typeof r !== 'object' || !r) {
                        return undefined;
                    }
                    if (!(0, util_1.has)('title')(r) || typeof r.title !== 'object' || !r.title) {
                        return undefined;
                    }
                    var title = r.title;
                    if (!(0, util_1.has)('simpleText')(title) || typeof title.simpleText !== 'string') {
                        return undefined;
                    }
                    if (!(0, util_1.has)('videoId')(r) || typeof r.videoId !== 'string') {
                        return undefined;
                    }
                    if (!(0, util_1.has)('longBylineText')(r) || typeof r.longBylineText !== 'object' || !r.longBylineText) {
                        return undefined;
                    }
                    var longBylineText = r.longBylineText;
                    if (!(0, util_1.has)('runs')(longBylineText) || !Array.isArray(longBylineText.runs)) {
                        return undefined;
                    }
                    var runs = longBylineText.runs;
                    if (runs.length === 0) {
                        return undefined;
                    }
                    if (!(0, util_1.has)('text')(runs[0]) || typeof runs[0].text !== 'string') {
                        return undefined;
                    }
                    if (!(0, util_1.has)('shortViewCountText')(r) || typeof r.shortViewCountText !== 'object' || !r.shortViewCountText) {
                        return undefined;
                    }
                    var shortViewCountText = r.shortViewCountText;
                    if (!(0, util_1.has)('simpleText')(shortViewCountText) || typeof shortViewCountText.simpleText !== 'string') {
                        return undefined;
                    }
                    if (!(0, util_1.has)('publishedTimeText')(r) || typeof r.publishedTimeText !== 'object' || !r.publishedTimeText) {
                        return undefined;
                    }
                    var publishedTimeText = r.publishedTimeText;
                    if (typeof publishedTimeText !== 'object' || !publishedTimeText) {
                        return undefined;
                    }
                    if (!(0, util_1.has)('simpleText')(publishedTimeText) || typeof publishedTimeText.simpleText !== 'string') {
                        return undefined;
                    }
                    var rec = {
                        title: title.simpleText,
                        videoId: r.videoId,
                        url: "/watch?v=".concat(r.videoId),
                        channelName: runs[0].text,
                        miniatureUrl: "https://i.ytimg.com/vi/".concat(r.videoId, "/hqdefault.jpg"),
                        hoverAnimationUrl: "https://i.ytimg.com/an_webp/".concat(r.videoId, "/mqdefault_6s.webp"),
                        views: shortViewCountText.simpleText,
                        publishedSince: publishedTimeText.simpleText,
                        personalization: 'unknown'
                    };
                    return rec;
                });
                return [2 /*return*/, recommendations.filter(function (r) { return Boolean(r); })];
        }
    });
}); };
exports.fetchRecommendations = fetchRecommendations;
var fetchNonPersonalizedRecommendations = function (videoUrl) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, (0, exports.fetchRecommendations)(videoUrl, false)];
}); }); };
exports.fetchNonPersonalizedRecommendations = fetchNonPersonalizedRecommendations;
var fetchDefaultRecommendations = function (videoUrl) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/, (0, exports.fetchRecommendations)(videoUrl, true)];
}); }); };
exports.fetchDefaultRecommendations = fetchDefaultRecommendations;
exports["default"] = exports.fetchNonPersonalizedRecommendations;

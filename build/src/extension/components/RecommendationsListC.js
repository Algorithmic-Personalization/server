"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RecommendationsListC = void 0;
var react_1 = __importStar(require("react"));
var styles_1 = require("@mui/material/styles");
var crypto_1 = __importDefault(require("crypto"));
var event_1 = __importStar(require("../../server/models/event"));
var recommendationsEvent_1 = __importDefault(require("../../server/models/recommendationsEvent"));
var createRecommendationsList_1 = __importDefault(require("../createRecommendationsList"));
var recommendationsFetcher_1 = require("../recommendationsFetcher");
var RecommendationC_1 = __importDefault(require("./RecommendationC"));
var util_1 = require("../../util");
var lib_1 = require("../lib");
var memo = (0, util_1.memoizeTemporarily)(10000);
var retry = (0, util_1.retryOnError)(2, 1000);
var fetchDefault = memo(retry(recommendationsFetcher_1.fetchDefaultRecommendations));
var fetchPersonalized = memo(retry(recommendationsFetcher_1.fetchNonPersonalizedRecommendations));
var hashRecommendationsList = function (recommendations) {
    var serialized = JSON.stringify(recommendations);
    var hash = crypto_1["default"].createHash('sha256');
    hash.update(serialized);
    return hash.digest('hex');
};
var NonPersonalized = (0, styles_1.styled)('span')(function () { return ({
    color: 'green'
}); });
var Personalized = (0, styles_1.styled)('span')(function () { return ({
    color: 'red'
}); });
var Mixed = (0, styles_1.styled)('span')(function () { return ({
    color: 'black'
}); });
var debugWrapper = function (r) {
    var personalization = r.personalization;
    if (personalization === 'non-personalized') {
        return NonPersonalized;
    }
    if (personalization === 'personalized') {
        return Personalized;
    }
    return Mixed;
};
var RecommendationsListC = function (_a) {
    var url = _a.url, cfg = _a.cfg, postEvent = _a.postEvent;
    var _b = __read((0, react_1.useState)([]), 2), nonPersonalizedRecommendations = _b[0], setNonPersonalizedRecommendations = _b[1];
    var _c = __read((0, react_1.useState)([]), 2), defaultRecommendations = _c[0], setDefaultRecommendations = _c[1];
    var _d = __read((0, react_1.useState)(true), 2), nonPersonalizedLoading = _d[0], setNonPersonalizedLoading = _d[1];
    var _e = __read((0, react_1.useState)(true), 2), defaultLoading = _e[0], setDefaultLoading = _e[1];
    var _f = __read((0, react_1.useState)([]), 2), finalRecommendations = _f[0], setFinalRecommendations = _f[1];
    var loading = nonPersonalizedLoading || defaultLoading;
    var loaded = !loading;
    (0, react_1.useEffect)(function () {
        if (!url) {
            return;
        }
        setNonPersonalizedLoading(true);
        setDefaultLoading(true);
        fetchPersonalized(url).then(function (recommendations) {
            setNonPersonalizedRecommendations(recommendations);
            setNonPersonalizedLoading(false);
            (0, lib_1.log)('setting non-personalized recommendations', { defaultRecommendations: hashRecommendationsList(recommendations) });
        })["catch"](function (err) {
            console.error('Error fetching non personalized recommendations', err);
        });
        fetchDefault(url).then(function (recommendations) {
            setDefaultRecommendations(recommendations);
            setDefaultLoading(false);
            (0, lib_1.log)('setting default recommendations', { defaultRecommendations: hashRecommendationsList(recommendations) });
        })["catch"](function (err) {
            console.error('Error fetching default recommendations', err);
        });
    }, [url]);
    (0, react_1.useEffect)(function () {
        if (!loaded || !url) {
            return;
        }
        (0, lib_1.log)({
            loaded: loaded,
            nonPersonalizedRecommendations: hashRecommendationsList(nonPersonalizedRecommendations),
            defaultRecommendations: hashRecommendationsList(defaultRecommendations)
        });
        var _a = __read((0, util_1.setPersonalizedFlags)(nonPersonalizedRecommendations, defaultRecommendations), 2), np = _a[0], p = _a[1];
        var finalRecommendations = (0, createRecommendationsList_1["default"])(cfg)(np, p);
        setFinalRecommendations(finalRecommendations);
        var event = new recommendationsEvent_1["default"](nonPersonalizedRecommendations, defaultRecommendations, finalRecommendations);
        event.url = url;
        postEvent(event)["catch"](console.error);
        console.log('LOADED!', url);
    }, [loaded, nonPersonalizedRecommendations, defaultRecommendations]);
    var createRecommendationClickHandler = function (rec) { return function () { return __awaiter(void 0, void 0, void 0, function () {
        var event, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event = new event_1["default"]();
                    event.url = rec.url;
                    if (rec.personalization === 'non-personalized') {
                        event.type = event_1.EventType.NON_PERSONALIZED_CLICKED;
                    }
                    else if (rec.personalization === 'personalized') {
                        event.type = event_1.EventType.PERSONALIZED_CLICKED;
                    }
                    else if (rec.personalization === 'mixed') {
                        event.type = event_1.EventType.MIXED_CLICKED;
                    }
                    else {
                        console.error('Unknown personalization', rec.personalization);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, postEvent(event)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error posting event', err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }; };
    var debugUi = (react_1["default"].createElement("div", null,
        react_1["default"].createElement("h1", null, "Debug view"),
        react_1["default"].createElement("h2", null, "Non-personalized recommendations"),
        react_1["default"].createElement("ul", null, nonPersonalizedRecommendations.map(function (rec) { return (react_1["default"].createElement("li", { key: rec.videoId }, rec.title)); })),
        react_1["default"].createElement("h2", null, "Personalized recommendations"),
        react_1["default"].createElement("ul", null, defaultRecommendations.map(function (rec) { return (react_1["default"].createElement("li", { key: rec.videoId }, rec.title)); })),
        react_1["default"].createElement("h2", null, "Final recommendations"),
        react_1["default"].createElement("p", null,
            "Arm: ",
            cfg.arm,
            react_1["default"].createElement("br", null)),
        react_1["default"].createElement("p", null,
            react_1["default"].createElement(NonPersonalized, null, "Non-personalized")),
        react_1["default"].createElement("p", null,
            react_1["default"].createElement(Personalized, null, "Personalized")),
        react_1["default"].createElement("p", null,
            react_1["default"].createElement(Mixed, null, "Mixed")),
        react_1["default"].createElement("p", null,
            react_1["default"].createElement("br", null)),
        react_1["default"].createElement("ul", null, finalRecommendations.map(function (rec) {
            var W = debugWrapper(rec);
            return (react_1["default"].createElement("li", { key: rec.videoId },
                react_1["default"].createElement(W, null, rec.title)));
        }))));
    var loadedUi = (react_1["default"].createElement("div", null, finalRecommendations.map(function (rec) { return react_1["default"].createElement(RecommendationC_1["default"], __assign({ key: rec.videoId }, rec, { handleRecommendationClicked: createRecommendationClickHandler(rec) })); })));
    return (react_1["default"].createElement("div", null,
        loading && (react_1["default"].createElement("p", null, "Loading...")),
        loaded && loadedUi,
        loaded && lib_1.debug && debugUi));
};
exports.RecommendationsListC = RecommendationsListC;
exports["default"] = exports.RecommendationsListC;

"use strict";
exports.__esModule = true;
exports.createRecommendationsList = exports.dedupe = void 0;
var util_1 = require("../util");
exports.dedupe = (0, util_1.removeDuplicates)(function (r) { return r.videoId; });
var createRecommendationsList = function (cfg) {
    return function (nonPersonalized, personalized) {
        var limit = Math.min(personalized.length, nonPersonalized.length);
        var tmpResult = [];
        var unused = [];
        for (var i = 0; i < limit; i++) {
            var takeNonPersonalized = Math.random() < cfg.nonPersonalizedProbability;
            if (takeNonPersonalized) {
                tmpResult.push(nonPersonalized[i]);
                unused.push(personalized[i]);
            }
            else {
                tmpResult.push(personalized[i]);
                unused.push(nonPersonalized[i]);
            }
        }
        return (0, exports.dedupe)(tmpResult.concat((0, util_1.shuffleArray)(unused)));
    };
};
exports.createRecommendationsList = createRecommendationsList;
exports["default"] = exports.createRecommendationsList;

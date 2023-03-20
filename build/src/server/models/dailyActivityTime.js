"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.DailyActivityTime = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var model_1 = __importDefault(require("../../common/lib/model"));
var participant_1 = __importDefault(require("./participant"));
var DailyActivityTime = /** @class */ (function (_super) {
    __extends(DailyActivityTime, _super);
    function DailyActivityTime() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.participantId = 0;
        _this.pagesViewed = 0;
        _this.videoPagesViewed = 0;
        _this.videoTimeViewedSeconds = 0;
        _this.timeSpentOnYoutubeSeconds = 0;
        _this.sidebarRecommendationsClicked = 0;
        return _this;
    }
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "participantId");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "pagesViewed");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "videoPagesViewed");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "videoTimeViewedSeconds");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "timeSpentOnYoutubeSeconds");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], DailyActivityTime.prototype, "sidebarRecommendationsClicked");
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return participant_1["default"]; }),
        (0, typeorm_1.JoinColumn)({ name: 'participant_id' }),
        __metadata("design:type", participant_1["default"])
    ], DailyActivityTime.prototype, "participant");
    DailyActivityTime = __decorate([
        (0, typeorm_1.Entity)()
    ], DailyActivityTime);
    return DailyActivityTime;
}(model_1["default"]));
exports.DailyActivityTime = DailyActivityTime;
exports["default"] = DailyActivityTime;
//# sourceMappingURL=dailyActivityTime.js.map
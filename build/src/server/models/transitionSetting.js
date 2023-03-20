"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
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
exports.TransitionSetting = exports.OperatorType = exports.Phase = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var model_1 = __importDefault(require("../../common/lib/model"));
var Phase;
(function (Phase) {
    Phase[Phase["PRE_EXPERIMENT"] = 0] = "PRE_EXPERIMENT";
    Phase[Phase["EXPERIMENT"] = 1] = "EXPERIMENT";
    Phase[Phase["POST_EXPERIMENT"] = 2] = "POST_EXPERIMENT";
})(Phase = exports.Phase || (exports.Phase = {}));
var OperatorType;
(function (OperatorType) {
    OperatorType["ANY"] = "ANY";
    OperatorType["ALL"] = "ALL";
})(OperatorType = exports.OperatorType || (exports.OperatorType = {}));
var TransitionSetting = /** @class */ (function (_super) {
    __extends(TransitionSetting, _super);
    function TransitionSetting() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fromPhase = 0;
        _this.toPhase = 0;
        _this.isCurrent = true;
        _this.operator = OperatorType.ANY;
        _this.minPagesViewed = 0;
        _this.minVideoPagesViewed = 0;
        _this.minVideoTimeViewedSeconds = 0;
        _this.minTimeSpentOnYoutubeSeconds = 0;
        _this.minSidebarRecommendationsClicked = 0;
        _this.minDays = 0;
        return _this;
    }
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        (0, class_validator_1.Max)(2),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "fromPhase");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        (0, class_validator_1.Max)(2),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "toPhase");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsBoolean)(),
        __metadata("design:type", Boolean)
    ], TransitionSetting.prototype, "isCurrent");
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], TransitionSetting.prototype, "operator");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minPagesViewed");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minVideoPagesViewed");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minVideoTimeViewedSeconds");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minTimeSpentOnYoutubeSeconds");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minSidebarRecommendationsClicked");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        __metadata("design:type", Number)
    ], TransitionSetting.prototype, "minDays");
    TransitionSetting = __decorate([
        (0, typeorm_1.Entity)()
    ], TransitionSetting);
    return TransitionSetting;
}(model_1["default"]));
exports.TransitionSetting = TransitionSetting;
exports["default"] = TransitionSetting;
//# sourceMappingURL=transitionSetting.js.map
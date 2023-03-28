"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransitionSetting = exports.OperatorType = exports.Phase = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../../common/lib/model"));
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
let TransitionSetting = class TransitionSetting extends model_1.default {
    constructor() {
        super(...arguments);
        this.fromPhase = 0;
        this.toPhase = 0;
        this.isCurrent = true;
        this.operator = OperatorType.ANY;
        this.minPagesViewed = 0;
        this.minVideoPagesViewed = 0;
        this.minVideoTimeViewedSeconds = 0;
        this.minTimeSpentOnYoutubeSeconds = 0;
        this.minSidebarRecommendationsClicked = 0;
        this.minDays = 0;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "fromPhase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "toPhase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TransitionSetting.prototype, "isCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransitionSetting.prototype, "operator", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minPagesViewed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minVideoPagesViewed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minVideoTimeViewedSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minTimeSpentOnYoutubeSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minSidebarRecommendationsClicked", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransitionSetting.prototype, "minDays", void 0);
TransitionSetting = __decorate([
    (0, typeorm_1.Entity)()
], TransitionSetting);
exports.TransitionSetting = TransitionSetting;
exports.default = TransitionSetting;
//# sourceMappingURL=transitionSetting.js.map
"use strict";
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
exports.DailyActivityTime = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../../common/lib/model"));
const participant_1 = __importDefault(require("./participant"));
let DailyActivityTime = class DailyActivityTime extends model_1.default {
    constructor() {
        super(...arguments);
        this.participantId = 0;
        this.pagesViewed = 0;
        this.videoPagesViewed = 0;
        this.videoTimeViewedSeconds = 0;
        this.timeSpentOnYoutubeSeconds = 0;
        this.sidebarRecommendationsClicked = 0;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "participantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "pagesViewed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "videoPagesViewed", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "videoTimeViewedSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "timeSpentOnYoutubeSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], DailyActivityTime.prototype, "sidebarRecommendationsClicked", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => participant_1.default),
    (0, typeorm_1.JoinColumn)({ name: 'participant_id' }),
    __metadata("design:type", participant_1.default)
], DailyActivityTime.prototype, "participant", void 0);
DailyActivityTime = __decorate([
    (0, typeorm_1.Entity)()
], DailyActivityTime);
exports.DailyActivityTime = DailyActivityTime;
exports.default = DailyActivityTime;
//# sourceMappingURL=dailyActivityTime.js.map
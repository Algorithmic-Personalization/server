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
/* eslint-disable @typescript-eslint/no-inferrable-types */
const typeorm_1 = require("typeorm");
const model_1 = __importDefault(require("../../common/lib/model"));
const class_validator_1 = require("class-validator");
let VideoMetadata = class VideoMetadata extends model_1.default {
    constructor() {
        super(...arguments);
        this.youtubeId = '';
        this.youtubeCategoryId = '';
        this.categoryTitle = '';
        this.youtubeChannelId = '';
        this.videoTitle = '';
        this.videoDescription = '';
        this.publishedAt = new Date(0);
        this.viewCount = -1;
        this.likeCount = -1;
        this.commentCount = -1;
        this.tags = [];
        this.topicCategories = [];
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "youtubeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "youtubeCategoryId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "categoryTitle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "youtubeChannelId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "videoTitle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "videoDescription", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinDate)(new Date(1)),
    __metadata("design:type", Date)
], VideoMetadata.prototype, "publishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VideoMetadata.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VideoMetadata.prototype, "likeCount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], VideoMetadata.prototype, "commentCount", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VideoMetadata.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], VideoMetadata.prototype, "topicCategories", void 0);
VideoMetadata = __decorate([
    (0, typeorm_1.Entity)()
], VideoMetadata);
exports.default = VideoMetadata;
//# sourceMappingURL=videoMetadata.js.map
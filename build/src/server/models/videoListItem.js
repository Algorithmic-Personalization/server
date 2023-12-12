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
exports.VideoListItem = exports.VideoType = exports.ListType = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../../common/lib/model"));
var ListType;
(function (ListType) {
    ListType["PERSONALIZED"] = "PERSONALIZED";
    ListType["NON_PERSONALIZED"] = "NON_PERSONALIZED";
    ListType["SHOWN"] = "SHOWN";
    ListType["HOME_DEFAULT"] = "HOME_DEFAULT";
    ListType["HOME_REPLACEMENT_SOURCE"] = "HOME_REPLACEMENT_SOURCE";
})(ListType = exports.ListType || (exports.ListType = {}));
var VideoType;
(function (VideoType) {
    VideoType["PERSONALIZED"] = "PERSONALIZED";
    VideoType["NON_PERSONALIZED"] = "NON_PERSONALIZED";
    VideoType["MIXED"] = "MIXED";
})(VideoType = exports.VideoType || (exports.VideoType = {}));
let VideoListItem = class VideoListItem extends model_1.default {
    constructor() {
        super(...arguments);
        this.eventId = 0;
        this.videoId = 0;
        this.position = 0;
        this.listType = ListType.SHOWN;
        this.videoType = VideoType.MIXED;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoListItem.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoListItem.prototype, "videoId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], VideoListItem.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VideoListItem.prototype, "listType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], VideoListItem.prototype, "videoType", void 0);
VideoListItem = __decorate([
    (0, typeorm_1.Entity)()
], VideoListItem);
exports.VideoListItem = VideoListItem;
exports.default = VideoListItem;
//# sourceMappingURL=videoListItem.js.map
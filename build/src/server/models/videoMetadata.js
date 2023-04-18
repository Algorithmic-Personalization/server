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
exports.MetadataType = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const typeorm_1 = require("typeorm");
const model_1 = __importDefault(require("../../common/lib/model"));
const class_validator_1 = require("class-validator");
var MetadataType;
(function (MetadataType) {
    MetadataType["TAG"] = "TAG";
    MetadataType["TOPIC_CATEGORY"] = "TOPIC_CATEGORY";
    MetadataType["YT_CATEGORY_ID"] = "YT_CATEGORY_ID";
    MetadataType["YT_CATEGORY_TITLE"] = "YT_CATEGORY_TITLE";
})(MetadataType = exports.MetadataType || (exports.MetadataType = {}));
let VideoMetadata = class VideoMetadata extends model_1.default {
    constructor() {
        super(...arguments);
        this.youtubeId = '';
        this.type = MetadataType.TAG;
        this.value = '';
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
    (0, class_validator_1.IsEnum)(MetadataType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VideoMetadata.prototype, "value", void 0);
VideoMetadata = __decorate([
    (0, typeorm_1.Entity)()
], VideoMetadata);
exports.default = VideoMetadata;
//# sourceMappingURL=videoMetadata.js.map
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
exports.RequestLog = exports.HttpVerb = void 0;
/* eslint-disable @typescript-eslint/no-inferrable-types */
const typeorm_1 = require("typeorm");
const model_1 = __importDefault(require("../../common/lib/model"));
const class_validator_1 = require("class-validator");
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["GET"] = "GET";
    HttpVerb["POST"] = "POST";
    HttpVerb["PUT"] = "PUT";
    HttpVerb["DELETE"] = "DELETE";
    HttpVerb["PATCH"] = "PATCH";
    HttpVerb["HEAD"] = "HEAD";
    HttpVerb["OPTIONS"] = "OPTIONS";
    HttpVerb["CONNECT"] = "CONNECT";
    HttpVerb["TRACE"] = "TRACE";
})(HttpVerb = exports.HttpVerb || (exports.HttpVerb = {}));
let RequestLog = class RequestLog extends model_1.default {
    constructor() {
        super(...arguments);
        this.latencyMs = 0;
        this.requestId = 0;
        this.verb = HttpVerb.GET;
        this.path = '';
        this.statusCode = 0;
        this.message = [];
        this.comment = [];
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], RequestLog.prototype, "latencyMs", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], RequestLog.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequestLog.prototype, "sessionUuid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestLog.prototype, "verb", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequestLog.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], RequestLog.prototype, "statusCode", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], RequestLog.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json'),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], RequestLog.prototype, "comment", void 0);
RequestLog = __decorate([
    (0, typeorm_1.Entity)()
], RequestLog);
exports.RequestLog = RequestLog;
exports.default = RequestLog;
//# sourceMappingURL=requestLog.js.map
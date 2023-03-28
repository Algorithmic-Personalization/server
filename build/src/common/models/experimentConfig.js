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
exports.ExperimentConfig = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../../common/lib/model"));
const admin_1 = __importDefault(require("./admin"));
let ExperimentConfig = class ExperimentConfig extends model_1.default {
    constructor() {
        super(...arguments);
        this.nonPersonalizedProbability = 0.5;
        this.comment = '';
        this.isCurrent = true;
        this.adminId = 0;
    }
};
__decorate([
    (0, typeorm_1.Column)({ type: 'double precision' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], ExperimentConfig.prototype, "nonPersonalizedProbability", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExperimentConfig.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], ExperimentConfig.prototype, "isCurrent", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ExperimentConfig.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_1.default, admin => admin.experimentConfigs),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", admin_1.default)
], ExperimentConfig.prototype, "admin", void 0);
ExperimentConfig = __decorate([
    (0, typeorm_1.Entity)()
], ExperimentConfig);
exports.ExperimentConfig = ExperimentConfig;
exports.default = ExperimentConfig;
//# sourceMappingURL=experimentConfig.js.map
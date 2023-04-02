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
exports.isValidPhase = exports.Participant = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../../common/lib/model"));
const event_1 = require("../../common/models/event");
const dailyActivityTime_1 = __importDefault(require("./dailyActivityTime"));
let Participant = class Participant extends model_1.default {
    constructor() {
        super(...arguments);
        this.code = '';
        this.phase = 0;
        this.arm = event_1.ExperimentArm.TREATMENT;
        this.extensionInstalled = false;
    }
};
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Participant.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], Participant.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Participant.prototype, "arm", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => dailyActivityTime_1.default, activityTime => activityTime.participant),
    __metadata("design:type", Array)
], Participant.prototype, "activityTimes", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Participant.prototype, "extensionInstalled", void 0);
Participant = __decorate([
    (0, typeorm_1.Entity)()
], Participant);
exports.Participant = Participant;
const isValidPhase = (phase) => typeof phase === 'number' && phase >= 0 && phase <= 2;
exports.isValidPhase = isValidPhase;
exports.default = Participant;
//# sourceMappingURL=participant.js.map
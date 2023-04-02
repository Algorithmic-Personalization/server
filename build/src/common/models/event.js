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
exports.Event = exports.isValidExperimentArm = exports.ExperimentArm = exports.EventType = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../lib/model"));
const util_1 = require("../util");
var EventType;
(function (EventType) {
    EventType["PAGE_VIEW"] = "PAGE_VIEW";
    EventType["RECOMMENDATIONS_SHOWN"] = "RECOMMENDATIONS_SHOWN";
    EventType["PERSONALIZED_CLICKED"] = "PERSONALIZED_CLICKED";
    EventType["NON_PERSONALIZED_CLICKED"] = "NON_PERSONALIZED_CLICKED";
    EventType["MIXED_CLICKED"] = "MIXED_CLICKED";
    EventType["WATCH_TIME"] = "WATCH_TIME";
    EventType["SESSION_END"] = "SESSION_END";
    EventType["PHASE_TRANSITION"] = "PHASE_TRANSITION";
    EventType["EXTENSION_INSTALLED"] = "EXTENSION_INSTALLED";
})(EventType = exports.EventType || (exports.EventType = {}));
var ExperimentArm;
(function (ExperimentArm) {
    ExperimentArm["TREATMENT"] = "treatment";
    ExperimentArm["CONTROL"] = "control";
})(ExperimentArm = exports.ExperimentArm || (exports.ExperimentArm = {}));
const isValidExperimentArm = (arm) => arm === ExperimentArm.TREATMENT || arm === ExperimentArm.CONTROL;
exports.isValidExperimentArm = isValidExperimentArm;
let Event = class Event extends model_1.default {
    constructor() {
        super(...arguments);
        this.sessionUuid = '';
        this.experimentConfigId = 0;
        this.arm = ExperimentArm.TREATMENT;
        this.type = EventType.PAGE_VIEW;
        this.url = '';
        this.localUuid = (0, util_1.uuidv4)();
        this.phase = 0;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Event.prototype, "sessionUuid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], Event.prototype, "experimentConfigId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "arm", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Event.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Event.prototype, "context", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Event.prototype, "localUuid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "extensionVersion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], Event.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Event.prototype, "tabActive", void 0);
Event = __decorate([
    (0, typeorm_1.Entity)()
], Event);
exports.Event = Event;
exports.default = Event;
//# sourceMappingURL=event.js.map
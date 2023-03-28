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
exports.TransitionEvent = exports.TransitionReason = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const dailyActivityTime_1 = __importDefault(require("./dailyActivityTime"));
var TransitionReason;
(function (TransitionReason) {
    TransitionReason["AUTOMATIC"] = "AUTOMATIC";
    TransitionReason["FORCED"] = "FORCED";
})(TransitionReason = exports.TransitionReason || (exports.TransitionReason = {}));
let TransitionEvent = class TransitionEvent extends dailyActivityTime_1.default {
    constructor() {
        super(...arguments);
        this.reason = TransitionReason.AUTOMATIC;
        this.fromPhase = 0;
        this.toPhase = 0;
        this.sidebarRecommendationsClicked = 0;
        this.numDays = 0;
    }
};
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "eventId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "transitionSettingId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TransitionEvent.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "fromPhase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(2),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "toPhase", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "sidebarRecommendationsClicked", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], TransitionEvent.prototype, "numDays", void 0);
TransitionEvent = __decorate([
    (0, typeorm_1.Entity)()
], TransitionEvent);
exports.TransitionEvent = TransitionEvent;
exports.default = TransitionEvent;
//# sourceMappingURL=transitionEvent.js.map
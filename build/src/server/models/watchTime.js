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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchTime = void 0;
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
let WatchTime = class WatchTime {
    constructor() {
        this.eventId = 0;
        this.secondsWatched = 0;
    }
};
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], WatchTime.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WatchTime.prototype, "secondsWatched", void 0);
WatchTime = __decorate([
    (0, typeorm_1.Entity)()
], WatchTime);
exports.WatchTime = WatchTime;
exports.default = WatchTime;
//# sourceMappingURL=watchTime.js.map
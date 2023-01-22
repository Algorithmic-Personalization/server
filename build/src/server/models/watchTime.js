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
exports.__esModule = true;
exports.WatchTime = void 0;
var class_validator_1 = require("class-validator");
var typeorm_1 = require("typeorm");
var WatchTime = /** @class */ (function () {
    function WatchTime() {
        this.eventId = 0;
        this.secondsWatched = 0;
    }
    __decorate([
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.IsPositive)(),
        (0, typeorm_1.PrimaryColumn)(),
        __metadata("design:type", Number)
    ], WatchTime.prototype, "eventId");
    __decorate([
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.IsPositive)(),
        (0, typeorm_1.Column)(),
        __metadata("design:type", Number)
    ], WatchTime.prototype, "secondsWatched");
    WatchTime = __decorate([
        (0, typeorm_1.Entity)()
    ], WatchTime);
    return WatchTime;
}());
exports.WatchTime = WatchTime;
exports["default"] = WatchTime;

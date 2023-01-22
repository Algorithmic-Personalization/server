"use strict";
/* eslint-disable @typescript-eslint/no-inferrable-types */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.__esModule = true;
exports.Event = exports.EventType = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var model_1 = __importDefault(require("../lib/model"));
var util_1 = require("../util");
var EventType;
(function (EventType) {
    EventType["PAGE_VIEW"] = "PAGE_VIEW";
    EventType["RECOMMENDATIONS_SHOWN"] = "RECOMMENDATIONS_SHOWN";
    EventType["PERSONALIZED_CLICKED"] = "PERSONALIZED_CLICKED";
    EventType["NON_PERSONALIZED_CLICKED"] = "NON_PERSONALIZED_CLICKED";
    EventType["MIXED_CLICKED"] = "MIXED_CLICKED";
    EventType["WATCH_TIME"] = "WATCH_TIME";
})(EventType = exports.EventType || (exports.EventType = {}));
var participant_1 = require("./participant");
var Event = /** @class */ (function (_super) {
    __extends(Event, _super);
    function Event() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.sessionUuid = '';
        _this.experimentConfigId = 0;
        _this.arm = participant_1.ExperimentArm.TREATMENT;
        _this.type = EventType.PAGE_VIEW;
        _this.url = '';
        _this.localUuid = (0, util_1.uuidv4)();
        return _this;
    }
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], Event.prototype, "sessionUuid");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.IsPositive)(),
        __metadata("design:type", Number)
    ], Event.prototype, "experimentConfigId");
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Event.prototype, "arm");
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", String)
    ], Event.prototype, "type");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], Event.prototype, "url");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsNotEmpty)(),
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], Event.prototype, "localUuid");
    Event = __decorate([
        (0, typeorm_1.Entity)()
    ], Event);
    return Event;
}(model_1["default"]));
exports.Event = Event;
exports["default"] = Event;

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
exports.ExperimentConfig = void 0;
var typeorm_1 = require("typeorm");
var class_validator_1 = require("class-validator");
var model_1 = __importDefault(require("../lib/model"));
var admin_1 = __importDefault(require("./admin"));
var ExperimentConfig = /** @class */ (function (_super) {
    __extends(ExperimentConfig, _super);
    function ExperimentConfig() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nonPersonalizedProbability = 0.5;
        _this.comment = '';
        _this.isCurrent = true;
        _this.adminId = 0;
        return _this;
    }
    __decorate([
        (0, typeorm_1.Column)({ type: 'double precision' }),
        (0, class_validator_1.IsNumber)(),
        (0, class_validator_1.Min)(0),
        (0, class_validator_1.Max)(1),
        __metadata("design:type", Number)
    ], ExperimentConfig.prototype, "nonPersonalizedProbability");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsString)(),
        __metadata("design:type", String)
    ], ExperimentConfig.prototype, "comment");
    __decorate([
        (0, typeorm_1.Column)(),
        __metadata("design:type", Boolean)
    ], ExperimentConfig.prototype, "isCurrent");
    __decorate([
        (0, typeorm_1.Column)(),
        (0, class_validator_1.IsInt)(),
        __metadata("design:type", Number)
    ], ExperimentConfig.prototype, "adminId");
    __decorate([
        (0, typeorm_1.ManyToOne)(function () { return admin_1["default"]; }, function (admin) { return admin.experimentConfigs; }),
        (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
        __metadata("design:type", admin_1["default"])
    ], ExperimentConfig.prototype, "admin");
    ExperimentConfig = __decorate([
        (0, typeorm_1.Entity)()
    ], ExperimentConfig);
    return ExperimentConfig;
}(model_1["default"]));
exports.ExperimentConfig = ExperimentConfig;
exports["default"] = ExperimentConfig;

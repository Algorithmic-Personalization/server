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
exports.Admin = void 0;
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const model_1 = __importDefault(require("../lib/model"));
const experimentConfig_1 = __importDefault(require("./experimentConfig"));
let Admin = class Admin extends model_1.default {
    constructor() {
        super(...arguments);
        this.name = '';
        this.email = '';
        this.password = '';
        this.verificationToken = '';
        this.emailVerified = false;
    }
};
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Admin.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Admin.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Admin.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(128, 128),
    __metadata("design:type", String)
], Admin.prototype, "verificationToken", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Admin.prototype, "emailVerified", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => experimentConfig_1.default, experimentConfig => experimentConfig.admin),
    __metadata("design:type", Array)
], Admin.prototype, "experimentConfigs", void 0);
Admin = __decorate([
    (0, typeorm_1.Entity)()
], Admin);
exports.Admin = Admin;
exports.default = Admin;
//# sourceMappingURL=admin.js.map
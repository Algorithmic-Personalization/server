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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpConfig = void 0;
const class_validator_1 = require("class-validator");
class SmtpAuth {
    constructor() {
        this.user = '';
        this.pass = '';
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SmtpAuth.prototype, "user", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SmtpAuth.prototype, "pass", void 0);
class SmtpConfig {
    constructor() {
        this.auth = new SmtpAuth();
        this.host = '';
        this.port = 0;
        this.secure = true;
    }
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    __metadata("design:type", SmtpAuth)
], SmtpConfig.prototype, "auth", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], SmtpConfig.prototype, "host", void 0);
__decorate([
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Object)
], SmtpConfig.prototype, "port", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Object)
], SmtpConfig.prototype, "secure", void 0);
exports.SmtpConfig = SmtpConfig;
exports.default = SmtpConfig;
//# sourceMappingURL=smtpConfig.js.map
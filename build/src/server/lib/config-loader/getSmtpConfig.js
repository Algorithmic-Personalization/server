"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSmtpConfig = void 0;
const class_validator_1 = require("class-validator");
const util_1 = require("../../../common/util");
const smtpConfig_1 = __importDefault(require("../smtpConfig"));
const ensureRecord_1 = __importDefault(require("./ensureRecord"));
const getSmtpConfig = (config) => __awaiter(void 0, void 0, void 0, function* () {
    (0, ensureRecord_1.default)(config);
    if (!(0, util_1.has)('smtp')(config)) {
        throw new Error('Missing smtp config in config.yml');
    }
    const smtpConfig = new smtpConfig_1.default();
    Object.assign(smtpConfig, config.smtp);
    const smtpConfigErrors = yield (0, class_validator_1.validate)(smtpConfig);
    if (smtpConfigErrors.length > 0) {
        console.error('Invalid smtp config in config.yml', smtpConfigErrors);
        process.exit(1);
    }
    return smtpConfig;
});
exports.getSmtpConfig = getSmtpConfig;
exports.default = exports.getSmtpConfig;
//# sourceMappingURL=getSmtpConfig.js.map
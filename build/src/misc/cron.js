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
const path_1 = require("path");
const fs_1 = require("fs");
const nodemailer_1 = __importDefault(require("nodemailer"));
const loadConfigYamlRaw_1 = __importDefault(require("../server/lib/config-loader/loadConfigYamlRaw"));
const getSmtpConfig_1 = __importDefault(require("../server/lib/config-loader/getSmtpConfig"));
const jobs_1 = __importDefault(require("../server/jobs"));
const logger_1 = require("./../server/lib/logger");
const util_1 = require("../common/util");
const server_1 = require("../server/server");
const util_2 = require("../util");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const root = yield (0, util_1.findPackageJsonDir)(__dirname);
    const logsDir = (0, path_1.join)(root, server_1.logsDirName);
    const writeStream = (0, fs_1.createWriteStream)((0, path_1.join)(logsDir, 'cron.log'), { flags: 'a' });
    const createDefaultLogger = (0, logger_1.makeCreateDefaultLogger)(writeStream);
    const log = createDefaultLogger('<cron>');
    const rawConfig = yield (0, loadConfigYamlRaw_1.default)();
    const smtpConfig = yield (0, getSmtpConfig_1.default)(rawConfig);
    const mailer = nodemailer_1.default.createTransport(smtpConfig);
    const jobsContext = {
        env: (0, server_1.getEnv)(),
        mailer,
        mailerFrom: smtpConfig.auth.user,
        log,
    };
    (0, jobs_1.default)(jobsContext).catch(err => {
        log('error', 'an error cancelled the CRONs', err);
        mailer.sendMail({
            from: smtpConfig.auth.user,
            to: 'fm.de.jouvencel@gmail.com',
            subject: 'An error cancelled the CRONs in YTDPNL',
            text: (0, util_2.stringFromMaybeError)(err),
        }).catch(err => {
            log('error', 'an error occurred while sending an error email', err);
        });
    });
});
main().catch(err => {
    console.error('an error occurred in the CRONs,', 'it should have been caught earlier,', 'this is bad', err);
});
//# sourceMappingURL=cron.js.map
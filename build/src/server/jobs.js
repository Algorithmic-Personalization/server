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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobs = void 0;
const child_process_1 = require("child_process");
const util_1 = require("../util");
const oneHourInMs = 60 * 60 * 1000;
const oneDayInMs = 24 * oneHourInMs;
const runAt = (hour, minute, log) => (fn, name = 'unspecified job') => {
    const now = new Date();
    const maybeNext = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    const next = maybeNext > now ? maybeNext : new Date(maybeNext.getTime() + oneDayInMs);
    const timeout = next.getTime() - now.getTime();
    const timeoutHours = timeout / (oneHourInMs);
    log === null || log === void 0 ? void 0 : log('info', `Scheduling ${name} to run in ${timeoutHours} hours`);
    const safeFunction = () => __awaiter(void 0, void 0, void 0, function* () {
        log === null || log === void 0 ? void 0 : log('info', `running job ${name}`);
        try {
            yield fn();
            log === null || log === void 0 ? void 0 : log('info', `job ${name} finished`);
        }
        catch (err) {
            log === null || log === void 0 ? void 0 : log('failed to run job', err);
        }
    });
    setTimeout(() => {
        void safeFunction();
        setInterval(safeFunction, oneDayInMs);
    }, timeout);
};
const startJobs = ({ log, env, mailer, mailerFrom, }) => __awaiter(void 0, void 0, void 0, function* () {
    const prefixIfDevelopment = (script) => {
        if (env === 'development') {
            return `development-${script}`;
        }
        return script;
    };
    const [backupScript, uploadScript] = [
        'backup-db', 'upload-backup',
    ].map(prefixIfDevelopment);
    const combineOutput = (
    // eslint-disable-next-line @typescript-eslint/ban-types
    err, stdout, stderr) => [
        (0, util_1.stringFromMaybeError)(err, 'no JS error'),
        '',
        'stdout:',
        stdout,
        '',
        'stderr:',
        stderr,
    ].join('\n');
    const doBackup = () => {
        log('info', 'starting backup...');
        (0, child_process_1.exec)(`./${backupScript}`, (err, stdout, stderr) => {
            const output = combineOutput(err, stdout, stderr);
            log(err ? 'error' : 'info', 'backup job finished', output);
            mailer.sendMail({
                from: mailerFrom,
                to: 'fm.de.jouvencel@gmail.com',
                subject: 'YTDPNL backup report',
                text: output,
            }).catch(err => {
                console.error('Failed to send backup report', err);
            });
        });
    };
    const doUploadBackup = () => {
        (0, child_process_1.exec)(`./${uploadScript}`, (err, stdout, stderr) => {
            log('info', 'starting upload-backup...');
            const output = combineOutput(err, stdout, stderr);
            log(err ? 'error' : 'info', 'upload-backup job finished', output);
            mailer.sendMail({
                from: mailerFrom,
                to: 'fm.de.jouvencel@gmail.com',
                subject: 'YTDPNL upload-backup report',
                text: output,
            }).catch(err => {
                console.error('Failed to send backup report', err);
            });
        });
    };
    runAt(11, 40, log)(doBackup, 'backup');
    runAt(11, 45, log)(doUploadBackup, 'upload backup');
});
exports.startJobs = startJobs;
exports.default = exports.startJobs;
//# sourceMappingURL=jobs.js.map
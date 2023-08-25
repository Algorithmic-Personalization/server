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
exports.makeCreateDefaultLogger = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const util_1 = require("util");
const node_gzip_1 = require("node-gzip");
const red = (str) => `\x1b[31m${str}\x1b[0m`;
const green = (str) => `\x1b[32m${str}\x1b[0m`;
const orange = (str) => `\x1b[33m${str}\x1b[0m`;
const blue = (str) => `\x1b[34m${str}\x1b[0m`;
const logSizeCheckInterval = 1000 * 60 * 60 * 24; // 24h
const compressAboveThresholdBytes = 1024 * 1024 * 32; // 32 MB
const getMonth = (d) => {
    const m = d.getMonth() + 1;
    if (m < 10) {
        return `0${m}`;
    }
    return m.toString(10);
};
const makeCreateDefaultLogger = (filePath) => (requestIdOrId) => {
    let prettyStream = (0, fs_1.createWriteStream)(filePath, { flags: 'a' });
    let checking = false;
    const checkLogSizeAndCompress = () => __awaiter(void 0, void 0, void 0, function* () {
        if (checking) {
            return;
        }
        try {
            checking = true;
            const s = yield (0, promises_1.stat)(filePath);
            if (s.size < compressAboveThresholdBytes) {
                return;
            }
            prettyStream.close();
            const tmpPath = `${filePath}.tmp`;
            yield (0, promises_1.cp)(filePath, tmpPath);
            prettyStream = (0, fs_1.createWriteStream)(filePath, { flags: 'w' });
            const contents = yield (0, promises_1.readFile)(tmpPath);
            const compressed = yield (0, node_gzip_1.gzip)(contents);
            const date = new Date();
            const y = date.getFullYear();
            const m = getMonth(date);
            const d = date.getDate();
            const h = date.getHours();
            const min = date.getMinutes();
            const secs = date.getSeconds();
            const rootName = (0, path_1.basename)(filePath, '.log');
            const dirName = (0, path_1.dirname)(filePath);
            const targetName = `${rootName}-${y}-${m}-${d} (${h}h${min}m${secs}s).log.gz`;
            const targetPath = (0, path_1.join)(dirName, targetName);
            (0, promises_1.writeFile)(targetPath, compressed).catch(err => {
                console.error('Error writing log file', targetPath, err);
            });
            yield (0, promises_1.rm)(tmpPath);
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                console.error('Something went wrong while checking the log size at:', filePath, e);
            }
        }
        finally {
            checking = false;
        }
    });
    setInterval(checkLogSizeAndCompress, logSizeCheckInterval);
    void checkLogSizeAndCompress();
    return (...args) => {
        const id = typeof requestIdOrId === 'number' ? `request #${requestIdOrId}` : requestIdOrId;
        const parts = [`\x1b[94m[${id} at ${new Date().toISOString()}]\x1b[0m`, ...args.map((arg, i) => {
                if (typeof arg === 'string' && i === 0) {
                    const str = arg.toLowerCase();
                    if (str === 'error' || str.startsWith('fail')) {
                        return red(str);
                    }
                    if (str === 'warning') {
                        return orange(str);
                    }
                    if (str === 'success') {
                        return green(str);
                    }
                    if (str === 'info') {
                        return blue(str);
                    }
                    return str;
                }
                if (typeof arg === 'string') {
                    return arg;
                }
                return (0, util_1.inspect)(arg, { depth: null, colors: true });
            })];
        console.log(...parts);
        prettyStream.write(`${parts.join(' ')}\n`);
    };
};
exports.makeCreateDefaultLogger = makeCreateDefaultLogger;
exports.default = exports.makeCreateDefaultLogger;
//# sourceMappingURL=logger.js.map
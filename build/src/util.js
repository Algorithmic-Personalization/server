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
exports.sleep = exports.showInsertSql = exports.showSql = exports.stringFromMaybeError = exports.asyncPerf = exports.pct = exports.formatPct = exports.formatSize = exports.daysElapsed = exports.withLock = exports.localNow = void 0;
const localNow = () => {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
    };
};
exports.localNow = localNow;
const locks = new Map();
const unstackLock = (id, log) => __awaiter(void 0, void 0, void 0, function* () {
    const stack = locks.get(id);
    if (!stack) {
        return;
    }
    if (stack.queue.length === 0) {
        return;
    }
    if (!stack.running) {
        const fn = stack.queue.shift();
        if (fn) {
            try {
                stack.running = fn.run();
                yield stack.running;
            }
            catch (error) {
                log === null || log === void 0 ? void 0 : log('error in unstackLock', { id, error });
            }
            finally {
                stack.running = undefined;
                clearInterval(fn.interval);
                yield unstackLock(id);
            }
            const newStack = locks.get(id);
            if (newStack && newStack.queue.length === 0) {
                locks.delete(id);
            }
        }
    }
});
const withLock = (id) => (fn, log) => __awaiter(void 0, void 0, void 0, function* () {
    if (!locks.has(id)) {
        locks.set(id, { running: undefined, queue: [] });
    }
    const lock = locks.get(id);
    if (!lock) {
        // Never happens but makes TS happy
        throw new Error('Lock is not defined');
    }
    const checkInterval = setInterval(() => {
        const now = new Date();
        const lock = locks.get(id);
        if (!lock) {
            clearInterval(checkInterval);
            return;
        }
        const oldest = lock.queue[0];
        if (!oldest) {
            clearInterval(checkInterval);
            return;
        }
        // TODO: this error should be emailed
        if (now.getTime() - oldest.queuedAt.getTime() > 1000 * 60 * 5) {
            log === null || log === void 0 ? void 0 : log('error', `Lock ${id} has been queued for more than 5 minutes, something is wrong`);
        }
    }, 1000 * 60);
    lock.queue.push({
        queuedAt: new Date(),
        run: fn,
        interval: checkInterval,
    });
    return unstackLock(id, log);
});
exports.withLock = withLock;
const daysElapsed = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};
exports.daysElapsed = daysElapsed;
const formatSize = (sizeInBytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = sizeInBytes;
    while (size > 1024) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
};
exports.formatSize = formatSize;
const formatPct = (pctBetween0And100) => `${pctBetween0And100.toFixed(2)}%`;
exports.formatPct = formatPct;
// Compute a percentage from 0 to 100 as a number, with two decimal places
const pct = (numerator, denominator) => Number(Math.round(100 * numerator / denominator).toFixed(2));
exports.pct = pct;
const asyncPerf = (f, identifier, customLog) => __awaiter(void 0, void 0, void 0, function* () {
    const tStart = Date.now();
    const log = customLog !== null && customLog !== void 0 ? customLog : console.log;
    const { heapTotal: heapTotalBefore, heapUsed: heapUsedBefore } = process.memoryUsage();
    let result;
    let threw = false;
    let error;
    try {
        result = yield f();
    }
    catch (e) {
        threw = true;
        error = e;
        throw e;
    }
    finally {
        const tElapsed = Date.now() - tStart;
        const { heapTotal: heapTotalAfter, heapUsed: heapUsedAfter } = process.memoryUsage();
        const heapTotalDiff = heapTotalAfter - heapTotalBefore;
        const heapUsedDiff = heapUsedAfter - heapUsedBefore;
        log(`${identifier !== null && identifier !== void 0 ? identifier : 'unspecified function'} took ${tElapsed}ms to run`);
        if (threw) {
            log('error', 'the function threw an error:', error);
        }
        log(`heap: total before = ${(0, exports.formatSize)(heapTotalBefore)}, total after = ${(0, exports.formatSize)(heapTotalAfter)}, diff = ${(0, exports.formatSize)(heapTotalDiff)}`);
        log(`heap: used before = ${(0, exports.formatSize)(heapUsedBefore)}, used after = ${(0, exports.formatSize)(heapUsedAfter)}, diff = ${(0, exports.formatSize)(heapUsedDiff)}`);
    }
    return result;
});
exports.asyncPerf = asyncPerf;
const stringFromMaybeError = (maybeError, defaultMessage = 'unknown error') => {
    if (!maybeError) {
        return defaultMessage;
    }
    if (maybeError instanceof Error) {
        return [
            maybeError.name,
            maybeError.message,
            maybeError.stack,
        ].join('\n');
    }
    return JSON.stringify(maybeError);
};
exports.stringFromMaybeError = stringFromMaybeError;
const showSql = (log) => (qb) => {
    const sql = qb.getSql();
    log('info', 'running query:', sql);
    return qb;
};
exports.showSql = showSql;
const showInsertSql = (log) => (qb) => {
    const sql = qb.getSql();
    log('info', 'running query:', sql);
    return qb;
};
exports.showInsertSql = showInsertSql;
const sleep = (ms) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
});
exports.sleep = sleep;
//# sourceMappingURL=util.js.map
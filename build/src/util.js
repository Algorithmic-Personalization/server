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
exports.daysElapsed = exports.withLock = void 0;
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
                stack.running = fn();
                yield stack.running;
            }
            catch (error) {
                log === null || log === void 0 ? void 0 : log('error in unstackLock', { id, error });
            }
            finally {
                stack.running = undefined;
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
    lock.queue.push(fn);
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
//# sourceMappingURL=util.js.map
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
exports.findPackageJsonDir = exports.makeApiVerbCreator = exports.restoreInnerInstance = exports.isMaybe = exports.validateExisting = exports.validateNew = exports.validateExcept = exports.getInteger = exports.getMessage = exports.getNumber = exports.getString = exports.get = exports.retryOnError = exports.wait = exports.memoizeTemporarily = exports.record = exports.has = exports.removeDuplicates = exports.shuffleArray = exports.setPersonalizedFlags = exports.uuidv4 = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
var uuid_1 = require("uuid");
Object.defineProperty(exports, "uuidv4", { enumerable: true, get: function () { return uuid_1.v4; } });
const class_validator_1 = require("class-validator");
const setPersonalizedFlags = (nonPersonalized, personalized) => {
    const nonPersonalizedSet = new Set();
    const personalizedSet = new Set();
    const nonPersonalizedOut = [];
    const personalizedOut = [];
    for (const rec of nonPersonalized) {
        nonPersonalizedSet.add(rec.videoId);
        nonPersonalizedOut.push(Object.assign({}, rec));
    }
    for (const rec of personalized) {
        personalizedSet.add(rec.videoId);
        personalizedOut.push(Object.assign({}, rec));
    }
    for (const rec of nonPersonalizedOut) {
        if (personalizedSet.has(rec.videoId)) {
            rec.personalization = 'mixed';
        }
        else {
            rec.personalization = 'non-personalized';
        }
    }
    for (const rec of personalizedOut) {
        if (nonPersonalizedSet.has(rec.videoId)) {
            rec.personalization = 'mixed';
        }
        else {
            rec.personalization = 'personalized';
        }
    }
    return [nonPersonalizedOut, personalizedOut];
};
exports.setPersonalizedFlags = setPersonalizedFlags;
// Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
};
exports.shuffleArray = shuffleArray;
const removeDuplicates = (identifier) => (array) => {
    const ids = new Set();
    const result = [];
    for (const item of array) {
        const id = identifier(item);
        if (!ids.has(id)) {
            result.push(item);
            ids.add(id);
        }
    }
    return result;
};
exports.removeDuplicates = removeDuplicates;
const has = (key) => (x) => typeof x === 'object' && x !== null && key in x;
exports.has = has;
const record = (key) => (x) => (0, exports.has)(key)(x) && typeof x[key] === 'object' && x[key] !== null;
exports.record = record;
const memoizeTemporarily = (ttlMs) => (f) => {
    const cache = new Map();
    return (x) => {
        if (cache.has(x)) {
            const out = cache.get(x);
            if (!out) {
                throw new Error('never happens');
            }
            return out;
        }
        const res = f(x);
        cache.set(x, res);
        setTimeout(() => {
            cache.delete(x);
        }, ttlMs);
        return res;
    };
};
exports.memoizeTemporarily = memoizeTemporarily;
const wait = (ms) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
});
exports.wait = wait;
const retryOnError = (maxAttempts, delayMs) => (f) => (x) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            // eslint-disable-next-line no-await-in-loop
            return yield f(x);
        }
        catch (error) {
            if (i === maxAttempts - 1) {
                throw error;
            }
            // eslint-disable-next-line no-await-in-loop
            yield (0, exports.wait)(delayMs);
        }
    }
    throw new Error('never happens');
});
exports.retryOnError = retryOnError;
const get = (path) => (x) => {
    let out = x;
    for (const key of path) {
        if (!(0, exports.has)(key)(out)) {
            throw new Error(`Missing property ${key} in object. Full path: ${path.join('.')}.`);
        }
        out = out[key];
    }
    return out;
};
exports.get = get;
const getString = (path) => (x) => {
    const out = (0, exports.get)(path)(x);
    if (typeof out !== 'string') {
        throw new Error(`Expected string at ${path.join('.')}, got ${JSON.stringify(out)}`);
    }
    return out;
};
exports.getString = getString;
const getNumber = (path) => (x) => {
    const out = (0, exports.get)(path)(x);
    if (typeof out !== 'number') {
        throw new Error(`Expected number at ${path.join('.')}, got ${JSON.stringify(out)}`);
    }
    return out;
};
exports.getNumber = getNumber;
const getMessage = (error, defaultMessage) => {
    if ((0, exports.has)('message')(error) && typeof error.message === 'string') {
        return error.message;
    }
    return defaultMessage;
};
exports.getMessage = getMessage;
const getInteger = (path) => (x) => {
    const out = (0, exports.getNumber)(path)(x);
    if (!Number.isInteger(out)) {
        throw new Error(`Expected integer at ${path.join('.')}, got ${JSON.stringify(out)}`);
    }
    return out;
};
exports.getInteger = getInteger;
const flattenErrors = (errors) => {
    const result = [];
    for (const error of errors) {
        if (error.children && error.children.length > 0) {
            result.push(...flattenErrors(error.children));
        }
        if (error.constraints) {
            result.push(...Object.values(error.constraints));
        }
    }
    return result;
};
// eslint-disable-next-line @typescript-eslint/ban-types
const validateExcept = (...fields) => (object) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = yield (0, class_validator_1.validate)(object);
    const filteredErrors = errors.filter(error => !fields.includes(error.property));
    return flattenErrors(filteredErrors);
});
exports.validateExcept = validateExcept;
exports.validateNew = (0, exports.validateExcept)('id');
exports.validateExisting = (0, exports.validateExcept)();
const isMaybe = (maybe) => {
    if (typeof maybe !== 'object' || maybe === null) {
        return false;
    }
    const { kind } = maybe;
    if (kind === 'Success') {
        const { value } = maybe;
        return value !== undefined;
    }
    if (kind === 'Failure') {
        const { message } = maybe;
        return typeof message === 'string';
    }
    return false;
};
exports.isMaybe = isMaybe;
// eslint-disable-next-line @typescript-eslint/ban-types
const restoreInnerInstance = (maybe, ctor) => {
    if (maybe.kind === 'Failure') {
        return maybe;
    }
    const { value } = maybe;
    const instance = new ctor();
    Object.assign(instance, value);
    return Object.assign(Object.assign({}, maybe), { value: instance });
};
exports.restoreInnerInstance = restoreInnerInstance;
const makeQueryString = (params) => {
    const entries = Object.entries(params);
    const chunks = entries.map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
    if (chunks.length === 0) {
        return '';
    }
    return `?${chunks.join('&')}`;
};
const makeApiVerbCreator = (serverUrl) => (method) => (path, data, headers) => __awaiter(void 0, void 0, void 0, function* () {
    const body = (method === 'POST' || method === 'PUT') ? JSON.stringify(data) : undefined;
    const qs = (method === 'GET' && !path.includes('?')) ? makeQueryString(data) : '';
    try {
        const result = yield fetch(`${serverUrl}${path}${qs}`, {
            method,
            body,
            headers,
        });
        const json = yield result.json();
        if ((0, exports.isMaybe)(json)) {
            return json;
        }
    }
    catch (e) {
        console.error(e);
        const err = {
            kind: 'Failure',
            message: 'Invalid or no response from server',
        };
        return err;
    }
    const res = {
        kind: 'Failure',
        message: 'Invalid response from server',
    };
    return res;
});
exports.makeApiVerbCreator = makeApiVerbCreator;
const findPackageJsonDir = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    const candidate = (0, path_1.join)(dir, 'package.json');
    try {
        const s = yield (0, promises_1.stat)(candidate);
        if (s.isFile()) {
            return dir;
        }
    }
    catch (e) {
        const parent = (0, path_1.join)(dir, '..');
        if (parent === dir) {
            throw new Error(`Cannot find package.json in ${dir} nor any of its parents`);
        }
        return (0, exports.findPackageJsonDir)(parent);
    }
    throw new Error('should never happen');
});
exports.findPackageJsonDir = findPackageJsonDir;
//# sourceMappingURL=util.js.map
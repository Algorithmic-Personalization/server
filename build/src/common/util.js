"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.findPackageJsonDir = exports.makeApiVerbCreator = exports.restoreInnerInstance = exports.isMaybe = exports.validateExisting = exports.validateNew = exports.validateExcept = exports.getInteger = exports.getMessage = exports.getNumber = exports.getString = exports.get = exports.retryOnError = exports.wait = exports.memoizeTemporarily = exports.has = exports.removeDuplicates = exports.shuffleArray = exports.setPersonalizedFlags = exports.uuidv4 = void 0;
var path_1 = require("path");
var promises_1 = require("fs/promises");
var uuid_1 = require("uuid");
__createBinding(exports, uuid_1, "v4", "uuidv4");
var class_validator_1 = require("class-validator");
var setPersonalizedFlags = function (nonPersonalized, personalized) {
    var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
    var nonPersonalizedSet = new Set();
    var personalizedSet = new Set();
    var nonPersonalizedOut = [];
    var personalizedOut = [];
    try {
        for (var nonPersonalized_1 = __values(nonPersonalized), nonPersonalized_1_1 = nonPersonalized_1.next(); !nonPersonalized_1_1.done; nonPersonalized_1_1 = nonPersonalized_1.next()) {
            var rec = nonPersonalized_1_1.value;
            nonPersonalizedSet.add(rec.videoId);
            nonPersonalizedOut.push(__assign({}, rec));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (nonPersonalized_1_1 && !nonPersonalized_1_1.done && (_a = nonPersonalized_1["return"])) _a.call(nonPersonalized_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var personalized_1 = __values(personalized), personalized_1_1 = personalized_1.next(); !personalized_1_1.done; personalized_1_1 = personalized_1.next()) {
            var rec = personalized_1_1.value;
            personalizedSet.add(rec.videoId);
            personalizedOut.push(__assign({}, rec));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (personalized_1_1 && !personalized_1_1.done && (_b = personalized_1["return"])) _b.call(personalized_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    try {
        for (var nonPersonalizedOut_1 = __values(nonPersonalizedOut), nonPersonalizedOut_1_1 = nonPersonalizedOut_1.next(); !nonPersonalizedOut_1_1.done; nonPersonalizedOut_1_1 = nonPersonalizedOut_1.next()) {
            var rec = nonPersonalizedOut_1_1.value;
            if (personalizedSet.has(rec.videoId)) {
                rec.personalization = 'mixed';
            }
            else {
                rec.personalization = 'non-personalized';
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (nonPersonalizedOut_1_1 && !nonPersonalizedOut_1_1.done && (_c = nonPersonalizedOut_1["return"])) _c.call(nonPersonalizedOut_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    try {
        for (var personalizedOut_1 = __values(personalizedOut), personalizedOut_1_1 = personalizedOut_1.next(); !personalizedOut_1_1.done; personalizedOut_1_1 = personalizedOut_1.next()) {
            var rec = personalizedOut_1_1.value;
            if (nonPersonalizedSet.has(rec.videoId)) {
                rec.personalization = 'mixed';
            }
            else {
                rec.personalization = 'personalized';
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (personalizedOut_1_1 && !personalizedOut_1_1.done && (_d = personalizedOut_1["return"])) _d.call(personalizedOut_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return [nonPersonalizedOut, personalizedOut];
};
exports.setPersonalizedFlags = setPersonalizedFlags;
// Fisher-Yates shuffle (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
var shuffleArray = function (array) {
    var _a;
    var shuffledArray = __spreadArray([], __read(array), false);
    for (var i = shuffledArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = __read([shuffledArray[j], shuffledArray[i]], 2), shuffledArray[i] = _a[0], shuffledArray[j] = _a[1];
    }
    return shuffledArray;
};
exports.shuffleArray = shuffleArray;
var removeDuplicates = function (identifier) { return function (array) {
    var e_5, _a;
    var ids = new Set();
    var result = [];
    try {
        for (var array_1 = __values(array), array_1_1 = array_1.next(); !array_1_1.done; array_1_1 = array_1.next()) {
            var item = array_1_1.value;
            var id = identifier(item);
            if (!ids.has(id)) {
                result.push(item);
                ids.add(id);
            }
        }
    }
    catch (e_5_1) { e_5 = { error: e_5_1 }; }
    finally {
        try {
            if (array_1_1 && !array_1_1.done && (_a = array_1["return"])) _a.call(array_1);
        }
        finally { if (e_5) throw e_5.error; }
    }
    return result;
}; };
exports.removeDuplicates = removeDuplicates;
var has = function (key) { return function (x) {
    return typeof x === 'object' && x !== null && key in x;
}; };
exports.has = has;
var memoizeTemporarily = function (ttlMs) { return function (f) {
    var cache = new Map();
    return function (x) {
        if (cache.has(x)) {
            var out = cache.get(x);
            if (!out) {
                throw new Error('never happens');
            }
            return out;
        }
        var res = f(x);
        cache.set(x, res);
        setTimeout(function () {
            cache["delete"](x);
        }, ttlMs);
        return res;
    };
}; };
exports.memoizeTemporarily = memoizeTemporarily;
var wait = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                setTimeout(resolve, ms);
            })];
    });
}); };
exports.wait = wait;
var retryOnError = function (maxAttempts, delayMs) { return function (f) { return function (x) { return __awaiter(void 0, void 0, void 0, function () {
    var i, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < maxAttempts)) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 6]);
                return [4 /*yield*/, f(x)];
            case 3: 
            // eslint-disable-next-line no-await-in-loop
            return [2 /*return*/, _a.sent()];
            case 4:
                error_1 = _a.sent();
                if (i === maxAttempts - 1) {
                    throw error_1;
                }
                // eslint-disable-next-line no-await-in-loop
                return [4 /*yield*/, (0, exports.wait)(delayMs)];
            case 5:
                // eslint-disable-next-line no-await-in-loop
                _a.sent();
                return [3 /*break*/, 6];
            case 6:
                i++;
                return [3 /*break*/, 1];
            case 7: throw new Error('never happens');
        }
    });
}); }; }; };
exports.retryOnError = retryOnError;
var get = function (path) { return function (x) {
    var e_6, _a;
    var out = x;
    try {
        for (var path_2 = __values(path), path_2_1 = path_2.next(); !path_2_1.done; path_2_1 = path_2.next()) {
            var key = path_2_1.value;
            if (!(0, exports.has)(key)(out)) {
                throw new Error("Missing property ".concat(key, " in ").concat(JSON.stringify(out)));
            }
            out = out[key];
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (path_2_1 && !path_2_1.done && (_a = path_2["return"])) _a.call(path_2);
        }
        finally { if (e_6) throw e_6.error; }
    }
    return out;
}; };
exports.get = get;
var getString = function (path) { return function (x) {
    var out = (0, exports.get)(path)(x);
    if (typeof out !== 'string') {
        throw new Error("Expected string at ".concat(path.join('.'), ", got ").concat(JSON.stringify(out)));
    }
    return out;
}; };
exports.getString = getString;
var getNumber = function (path) { return function (x) {
    var out = (0, exports.get)(path)(x);
    if (typeof out !== 'number') {
        throw new Error("Expected number at ".concat(path.join('.'), ", got ").concat(JSON.stringify(out)));
    }
    return out;
}; };
exports.getNumber = getNumber;
var getMessage = function (error, defaultMessage) {
    if ((0, exports.has)('message')(error) && typeof error.message === 'string') {
        return error.message;
    }
    return defaultMessage;
};
exports.getMessage = getMessage;
var getInteger = function (path) { return function (x) {
    var out = (0, exports.getNumber)(path)(x);
    if (!Number.isInteger(out)) {
        throw new Error("Expected integer at ".concat(path.join('.'), ", got ").concat(JSON.stringify(out)));
    }
    return out;
}; };
exports.getInteger = getInteger;
var flattenErrors = function (errors) {
    var e_7, _a;
    var result = [];
    try {
        for (var errors_1 = __values(errors), errors_1_1 = errors_1.next(); !errors_1_1.done; errors_1_1 = errors_1.next()) {
            var error = errors_1_1.value;
            if (error.children && error.children.length > 0) {
                result.push.apply(result, __spreadArray([], __read(flattenErrors(error.children)), false));
            }
            if (error.constraints) {
                result.push.apply(result, __spreadArray([], __read(Object.values(error.constraints)), false));
            }
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (errors_1_1 && !errors_1_1.done && (_a = errors_1["return"])) _a.call(errors_1);
        }
        finally { if (e_7) throw e_7.error; }
    }
    return result;
};
// eslint-disable-next-line @typescript-eslint/ban-types
var validateExcept = function () {
    var fields = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fields[_i] = arguments[_i];
    }
    return function (object) { return __awaiter(void 0, void 0, void 0, function () {
        var errors, filteredErrors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, class_validator_1.validate)(object)];
                case 1:
                    errors = _a.sent();
                    filteredErrors = errors.filter(function (error) { return !fields.includes(error.property); });
                    return [2 /*return*/, flattenErrors(filteredErrors)];
            }
        });
    }); };
};
exports.validateExcept = validateExcept;
exports.validateNew = (0, exports.validateExcept)('id');
exports.validateExisting = (0, exports.validateExcept)();
var isMaybe = function (maybe) {
    if (typeof maybe !== 'object' || maybe === null) {
        return false;
    }
    var kind = maybe.kind;
    if (kind === 'Success') {
        var value = maybe.value;
        return value !== undefined;
    }
    if (kind === 'Failure') {
        var message = maybe.message;
        return typeof message === 'string';
    }
    return false;
};
exports.isMaybe = isMaybe;
// eslint-disable-next-line @typescript-eslint/ban-types
var restoreInnerInstance = function (maybe, ctor) {
    if (maybe.kind === 'Failure') {
        return maybe;
    }
    var value = maybe.value;
    var instance = new ctor();
    Object.assign(instance, value);
    return __assign(__assign({}, maybe), { value: instance });
};
exports.restoreInnerInstance = restoreInnerInstance;
var makeApiVerbCreator = function (serverUrl) {
    return function (method) { return function (path, data, headers) { return __awaiter(void 0, void 0, void 0, function () {
        var body, result, json, e_8, err, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    body = method === 'POST' ? JSON.stringify(data) : undefined;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("".concat(serverUrl).concat(path), {
                            method: method,
                            body: body,
                            headers: headers
                        })];
                case 2:
                    result = _a.sent();
                    return [4 /*yield*/, result.json()];
                case 3:
                    json = _a.sent();
                    if ((0, exports.isMaybe)(json)) {
                        return [2 /*return*/, json];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_8 = _a.sent();
                    console.error(e_8);
                    err = {
                        kind: 'Failure',
                        message: 'Invalid or no response from server'
                    };
                    return [2 /*return*/, err];
                case 5:
                    res = {
                        kind: 'Failure',
                        message: 'Invalid response from server'
                    };
                    return [2 /*return*/, res];
            }
        });
    }); }; };
};
exports.makeApiVerbCreator = makeApiVerbCreator;
var findPackageJsonDir = function (dir) { return __awaiter(void 0, void 0, void 0, function () {
    var candidate, s, e_9, parent_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                candidate = (0, path_1.join)(dir, 'package.json');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, promises_1.stat)(candidate)];
            case 2:
                s = _a.sent();
                if (s.isFile()) {
                    return [2 /*return*/, dir];
                }
                return [3 /*break*/, 4];
            case 3:
                e_9 = _a.sent();
                parent_1 = (0, path_1.join)(dir, '..');
                if (parent_1 === dir) {
                    throw new Error("Cannot find package.json in ".concat(dir, " nor any of its parents"));
                }
                return [2 /*return*/, (0, exports.findPackageJsonDir)(parent_1)];
            case 4: throw new Error('should never happen');
        }
    });
}); };
exports.findPackageJsonDir = findPackageJsonDir;

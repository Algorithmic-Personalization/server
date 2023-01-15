"use strict";
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
exports.createDefaultLogger = void 0;
var createDefaultLogger = function (f) { return function (requestId) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var parts = __spreadArray(["[request #".concat(requestId, " at ").concat(new Date().toISOString(), "]")], __read(args.map(function (arg) {
            if (typeof arg === 'string') {
                return arg.toLowerCase();
            }
            return arg;
        })), false);
        console.log.apply(console, __spreadArray([], __read(parts), false));
        f.write("".concat(parts.join(' '), "\n"));
    };
}; };
exports.createDefaultLogger = createDefaultLogger;
exports["default"] = exports.createDefaultLogger;

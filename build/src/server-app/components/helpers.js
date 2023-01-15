"use strict";
exports.__esModule = true;
exports.bind = exports.takeValue = void 0;
var takeValue = function (fn) {
    return function (e) {
        fn(e.target.value);
    };
};
exports.takeValue = takeValue;
var bind = function (value, setValue) { return ({
    value: value,
    onChange: (0, exports.takeValue)(setValue)
}); };
exports.bind = bind;

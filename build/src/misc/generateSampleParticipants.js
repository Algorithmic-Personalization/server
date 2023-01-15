"use strict";
exports.__esModule = true;
var crypto_1 = require("../server/lib/crypto");
var count = process.argv[2] || 1000;
console.log('email,code,arm');
for (var i = 0; i < count; i++) {
    var email = "".concat((0, crypto_1.randomToken)(10), "@example.com");
    var code = (0, crypto_1.randomToken)(32);
    var arm = Math.random() < 0.5 ? 'control' : 'treatment';
    console.log("".concat(email, ",").concat(code, ",").concat(arm));
}

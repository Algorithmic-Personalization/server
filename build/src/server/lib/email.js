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
exports.createMailService = void 0;
const util_1 = require("util");
const createMailService = (deps) => ({ to, subject, text, html, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deps.transport.sendMail({
            from: deps.from,
            to,
            subject,
            text,
            html: html !== null && html !== void 0 ? html : `<pre>${text}</pre>`,
        });
        return true;
    }
    catch (err) {
        deps.log('error', 'while sending an email', [
            `from ${deps.from} to ${to}`,
            `subject: ${subject}`,
            `text: ${text}`,
            `html: ${html !== null && html !== void 0 ? html : '<none>'}`,
            `error: ${(0, util_1.inspect)(err)}`,
        ]);
        return false;
    }
});
exports.createMailService = createMailService;
//# sourceMappingURL=email.js.map
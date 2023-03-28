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
const util_1 = require("./util");
const wait = (ms) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
});
describe('the "withLock" function', () => {
    it('allows to run sequentially parallel requests', () => __awaiter(void 0, void 0, void 0, function* () {
        const results = [];
        const f1 = (0, util_1.withLock)('lock')(() => __awaiter(void 0, void 0, void 0, function* () {
            yield wait(Math.random() * 100);
            results.push(1);
        }));
        const f2 = (0, util_1.withLock)('lock')(() => __awaiter(void 0, void 0, void 0, function* () {
            yield wait(Math.random() * 100);
            results.push(2);
        }));
        const f3 = (0, util_1.withLock)('lock')(() => __awaiter(void 0, void 0, void 0, function* () {
            yield wait(Math.random() * 100);
            results.push(3);
        }));
        yield Promise.all([f1, f2, f3]);
        expect(results).toEqual([1, 2, 3]);
    }));
});
//# sourceMappingURL=util.test.js.map
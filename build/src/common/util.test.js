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
describe('removeDuplicates', () => {
    it('should remove duplicates in a basic array', () => {
        const input = [1, 2, 2, 3];
        const expected = [1, 2, 3];
        const actual = (0, util_1.removeDuplicates)(x => x)(input);
        expect(actual).toEqual(expected);
    });
    it('should remove duplicates in an array of objects', () => {
        const input = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
        const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const actual = (0, util_1.removeDuplicates)((x) => x.id)(input);
        expect(actual).toEqual(expected);
    });
});
describe('memoizeTemporarily', () => {
    it('should memoize a function for a bit', () => __awaiter(void 0, void 0, void 0, function* () {
        let counter = 0;
        const fn = () => ++counter;
        const mfn = (0, util_1.memoizeTemporarily)(100)(fn);
        const first = mfn('unused');
        const second = mfn('unused');
        expect(first).toBe(1);
        expect(second).toBe(1);
        yield (0, util_1.wait)(200);
        const third = mfn('unused');
        expect(third).toBe(2);
    }));
});
//# sourceMappingURL=util.test.js.map
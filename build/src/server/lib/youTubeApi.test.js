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
const youTubeApi_1 = require("./youTubeApi");
describe('isVideoAvailable', () => {
    it('should reply `true` for an available video', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield (0, youTubeApi_1.isVideoAvailable)('Vg91dht58vE')).toBe(true);
    }));
    it('should reply `false` for a private video', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield (0, youTubeApi_1.isVideoAvailable)('mIbYcTuJOPo')).toBe(false);
    }));
    it('should reply `false` for a deleted video', () => __awaiter(void 0, void 0, void 0, function* () {
        expect(yield (0, youTubeApi_1.isVideoAvailable)('0zLBgvymn74')).toBe(false);
    }));
});
//# sourceMappingURL=youTubeApi.test.js.map
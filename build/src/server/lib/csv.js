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
exports.parse = void 0;
const csv_parse_1 = require("csv-parse");
const parse = (csv) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const parser = (0, csv_parse_1.parse)({ columns: true });
        const records = [];
        parser.on('readable', () => {
            for (;;) {
                const record = parser.read();
                if (!record) {
                    break;
                }
                records.push(record);
            }
        });
        parser.on('error', reject);
        parser.on('end', () => {
            resolve(records);
        });
        parser.write(csv);
        parser.end();
    });
});
exports.parse = parse;
//# sourceMappingURL=csv.js.map
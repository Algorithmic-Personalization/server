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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const voucher_1 = __importDefault(require("../models/voucher"));
const addVouchersDefinition = {
    verb: 'post',
    path: '/api/voucher',
    makeHandler: ({ createLogger, dataSource }) => (req) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLogger(req.requestId);
        log('info', 'Received add vouchers request');
        const vouchers = req.body;
        if (!Array.isArray(vouchers)) {
            throw new Error('Invalid vouchers record, please post a JSON array of voucher codes');
        }
        const entities = [];
        for (const code of vouchers) {
            if (typeof code !== 'string' || code.length === 0) {
                throw new Error('Invalid voucher code, please post a JSON array of voucher codes');
            }
            const entity = new voucher_1.default();
            entity.voucherCode = code;
            entities.push(entity);
        }
        const voucherRepo = dataSource.getRepository(voucher_1.default);
        const saved = yield voucherRepo.save(entities);
        return saved;
    }),
};
exports.default = addVouchersDefinition;
//# sourceMappingURL=addVouchers.js.map
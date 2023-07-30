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
exports.createVoucherService = void 0;
/* eslint-disable @typescript-eslint/consistent-type-imports */
const typeorm_1 = require("typeorm");
const voucher_1 = __importDefault(require("../models/voucher"));
const createVoucherService = ({ log, dataSource }) => ({
    getAndMarkOneAsUsed(participantId) {
        return __awaiter(this, void 0, void 0, function* () {
            log('info', 'attempting to get voucher for participant', { participantId });
            const qr = dataSource.createQueryRunner();
            try {
                yield qr.startTransaction();
                const repo = qr.manager.getRepository(voucher_1.default);
                const voucher = yield repo
                    .createQueryBuilder('voucher')
                    .useTransaction(true)
                    .setLock('pessimistic_write')
                    .where({ participantId: (0, typeorm_1.IsNull)() })
                    .getOne();
                if (voucher) {
                    voucher.participantId = participantId;
                    voucher.deliveredAt = new Date();
                    const saved = yield repo.save(voucher);
                    yield qr.commitTransaction();
                    return saved;
                }
                return undefined;
            }
            catch (e) {
                log('error', 'error getting voucher', e);
                yield qr.rollbackTransaction();
                return undefined;
            }
            finally {
                yield qr.release();
            }
        });
    },
    countAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = dataSource.getRepository(voucher_1.default);
            const vouchersLeft = yield repo.count({
                where: {
                    participantId: (0, typeorm_1.IsNull)(),
                },
            });
            return vouchersLeft;
        });
    },
});
exports.createVoucherService = createVoucherService;
exports.default = exports.createVoucherService;
//# sourceMappingURL=voucherService.js.map
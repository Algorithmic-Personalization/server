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
const db_1 = __importDefault(require("../server/tests-util/db"));
const crypto_1 = require("../server/lib/crypto");
const voucher_1 = __importDefault(require("../server/models/voucher"));
const voucherService_1 = require("../server/lib/voucherService");
describe('getVoucher', () => {
    let db;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        db = yield (0, db_1.default)(true);
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield db.tearDown();
    }));
    const createVouchers = (count) => __awaiter(void 0, void 0, void 0, function* () {
        const vouchers = [];
        for (let i = 0; i < count; ++i) {
            const voucher = new voucher_1.default();
            voucher.voucherCode = (0, crypto_1.randomToken)(32);
            vouchers.push(voucher);
        }
        const repo = db.dataSource.getRepository(voucher_1.default);
        yield repo.save(vouchers);
    });
    it('should return a voucher for one participant', () => __awaiter(void 0, void 0, void 0, function* () {
        const participant = yield db.createParticipant();
        yield createVouchers(1);
        const vouchers = (0, voucherService_1.createVoucherService)({
            dataSource: db.dataSource,
            log: jest.fn(),
        });
        const voucher = yield vouchers.getAndMarkOneAsUsed(participant.id);
        expect(voucher).toBeDefined();
    }));
    it('should fail to return a voucher for one participant if there are no vouchers', () => __awaiter(void 0, void 0, void 0, function* () {
        const vouchers = (0, voucherService_1.createVoucherService)({
            dataSource: db.dataSource,
            log: jest.fn(),
        });
        const vouchersLeft = yield vouchers.countAvailable();
        expect(vouchersLeft).toBe(0);
        const participant = yield db.createParticipant();
        const voucher = yield vouchers.getAndMarkOneAsUsed(participant.id);
        expect(voucher).toBeUndefined();
    }));
    const voucherRequestParallelTests = [
        {
            nParticipants: 2,
            nVouchers: 2,
            nRequestsPerParticipant: 1,
        },
        {
            nParticipants: 2,
            nVouchers: 2,
            nRequestsPerParticipant: 2,
        },
        {
            nParticipants: 2,
            nVouchers: 2,
            nRequestsPerParticipant: 10,
        },
        {
            nParticipants: 3,
            nVouchers: 2,
            nRequestsPerParticipant: 5,
        },
    ];
    test.each(voucherRequestParallelTests)('should not deliver too many vouchers even concurrently ($nParticipants participants, $nVouchers vouchers, $nRequestsPerParticipant requests per participant)', (scenario) => __awaiter(void 0, void 0, void 0, function* () {
        const { nParticipants, nVouchers, nRequestsPerParticipant, } = scenario;
        const vouchers = (0, voucherService_1.createVoucherService)({
            dataSource: db.dataSource,
            log: jest.fn(),
        });
        expect(yield vouchers.countAvailable()).toBe(0);
        yield createVouchers(nVouchers);
        const participants = yield Promise.all(Array.from({ length: nParticipants }).map(() => __awaiter(void 0, void 0, void 0, function* () { return db.createParticipant(); })));
        const voucherRequests = [];
        const vouchersObtained = new Map();
        participants.forEach(participant => {
            for (let i = 0; i < nRequestsPerParticipant; ++i) {
                const req = vouchers.getAndMarkOneAsUsed(participant.id);
                const check = req.then(v => {
                    var _a;
                    if (v) {
                        const n = (_a = vouchersObtained.get(participant.id)) !== null && _a !== void 0 ? _a : 0;
                        vouchersObtained.set(participant.id, n + 1);
                    }
                });
                voucherRequests.push(check);
            }
        });
        yield Promise.all(voucherRequests);
        const vouchersReceived = [...vouchersObtained.values()].reduce((acc, n) => acc + n, 0);
        if (nVouchers < nParticipants) {
            for (const [, nObtained] of vouchersObtained) {
                expect(nObtained).toBeLessThanOrEqual(1);
            }
        }
        else {
            for (const [, nObtained] of vouchersObtained) {
                expect(nObtained).toBe(1);
            }
        }
        expect(vouchersReceived).toBe(Math.min(nParticipants, nVouchers));
    }), 10000);
});
//# sourceMappingURL=voucherService.test.js.map
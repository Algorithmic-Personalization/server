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
exports.createAuthTestRoute = void 0;
const admin_1 = __importDefault(require("../../common/models/admin"));
const createAuthTestRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received auth test request');
    const adminRepo = dataSource.getRepository(admin_1.default);
    if (req.adminId === undefined) {
        res.status(401).json({ kind: 'Failure', message: 'Not authenticated' });
        return;
    }
    try {
        const admin = yield adminRepo.findOneBy({ id: req.adminId });
        if (!admin) {
            log('Admin not found:', req.adminId);
            res.status(401).json({ kind: 'Failure', message: 'Not authenticated' });
            return;
        }
        log('Fetched admin:', admin === null || admin === void 0 ? void 0 : admin.email);
        res.json({ kind: 'Success', value: admin });
    }
    catch (err) {
        log('Failed to fetch admin:', err);
        res.status(500).json({ kind: 'Failure', message: 'Failed to fetch admin' });
    }
});
exports.createAuthTestRoute = createAuthTestRoute;
exports.default = exports.createAuthTestRoute;
//# sourceMappingURL=authTest.js.map
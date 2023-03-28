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
exports.createTokenTools = exports.checkPassword = exports.hashPassword = exports.randomToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const util_1 = require("../../common/util");
const randomToken = (size = 128) => crypto_1.default.randomBytes(size).toString('hex');
exports.randomToken = randomToken;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.hash(password, 10, (err, hash) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(hash);
        });
    });
});
exports.hashPassword = hashPassword;
const checkPassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        bcrypt_1.default.compare(password, hash, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
});
exports.checkPassword = checkPassword;
const createTokenTools = (secretKey) => ({
    sign: (expiresIn, adminId) => jsonwebtoken_1.default.sign({ adminId }, secretKey, { expiresIn, algorithm: 'RS256' }),
    verify(token) {
        try {
            const json = jsonwebtoken_1.default.verify(token, secretKey, { algorithms: ['RS256'] });
            if (!(0, util_1.has)('iat')(json) || !(0, util_1.has)('exp')(json) || typeof json.iat !== 'number' || typeof json.exp !== 'number') {
                return {
                    kind: 'Failure',
                    message: 'Invalid token contents',
                };
            }
            if (!(0, util_1.has)('adminId')(json) || typeof json.adminId !== 'number') {
                return {
                    kind: 'Failure',
                    message: 'Missing adminId in token',
                };
            }
            const iat = new Date(json.iat * 1000);
            const exp = new Date(json.exp * 1000);
            if (iat > exp) {
                return {
                    kind: 'Failure',
                    message: 'Token expired',
                };
            }
            const { adminId } = json;
            return { kind: 'Success', value: { adminId } };
        }
        catch (err) {
            return {
                kind: 'Failure',
                message: 'Invalid token',
            };
        }
    },
});
exports.createTokenTools = createTokenTools;
//# sourceMappingURL=crypto.js.map
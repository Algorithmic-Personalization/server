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
exports.createDeleteApiTokenRoute = void 0;
const token_1 = __importDefault(require("../models/token"));
const createDeleteApiTokenRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('received delete api token request');
    const { token } = req.params;
    if (!token || typeof token !== 'string') {
        res.status(400).json({ kind: 'Failure', message: 'Missing or invalid token' });
        return;
    }
    const { adminId } = req;
    if (!adminId || typeof adminId !== 'number') {
        res.status(401).json({ kind: 'Failure', message: 'Unauthorized' });
        return;
    }
    const repo = dataSource.getRepository(token_1.default);
    try {
        yield repo.delete({ token });
        res.status(200).json({ kind: 'Success', value: token });
    }
    catch (error) {
        log('error deleting api token', error);
        res.status(500).json({ kind: 'Error', message: 'Error getting api tokens' });
    }
});
exports.createDeleteApiTokenRoute = createDeleteApiTokenRoute;
exports.default = exports.createDeleteApiTokenRoute;
//# sourceMappingURL=deleteApiToken.js.map
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
exports.createCreateSessionRoute = void 0;
const session_1 = __importDefault(require("../../common/models/session"));
const createCreateSessionRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    const code = req.participantCode;
    log('Received create session request for participant code:', code);
    if (code === undefined) {
        res.status(400).json({ kind: 'Failure', message: 'Missing participant code' });
        return;
    }
    const repo = dataSource.getRepository(session_1.default);
    const session = new session_1.default();
    session.participantCode = code;
    try {
        const saved = yield repo.save(session);
        res.send({ kind: 'Success', value: saved });
    }
    catch (error) {
        log('Failed to create session:', error);
        res.status(500).json({ kind: 'Failure', message: 'Failed to create session' });
    }
});
exports.createCreateSessionRoute = createCreateSessionRoute;
exports.default = exports.createCreateSessionRoute;
//# sourceMappingURL=createSession.js.map
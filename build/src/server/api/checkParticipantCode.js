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
exports.createPostCheckParticipantCodeRoute = void 0;
const participant_1 = __importDefault(require("../models/participant"));
const createPostCheckParticipantCodeRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received check participant code request');
    const { code } = req.body;
    if (code === undefined) {
        res.status(400).send('Missing participant code');
        return;
    }
    const repo = dataSource.getRepository(participant_1.default);
    const exists = yield repo.findOneBy({
        code,
    });
    if (!exists) {
        res.status(400).json({ kind: 'Failure', message: 'Invalid participant code' });
        return;
    }
    res.status(200).json({ kind: 'Success', value: 'Participant code is valid' });
});
exports.createPostCheckParticipantCodeRoute = createPostCheckParticipantCodeRoute;
exports.default = exports.createPostCheckParticipantCodeRoute;
//# sourceMappingURL=checkParticipantCode.js.map
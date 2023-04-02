"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createGetParticipantsRoute = void 0;
const pagination_1 = require("../lib/pagination");
const participant_1 = __importStar(require("../models/participant"));
const typeorm_1 = require("typeorm");
const translateExtensionInstalledFilter = (extensionInstalled) => {
    if (extensionInstalled === 'yes') {
        return true;
    }
    if (extensionInstalled === 'no') {
        return false;
    }
    return undefined;
};
const createGetParticipantsRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received participants request');
    const { page, pageSize } = (0, pagination_1.extractPaginationRequest)(req);
    const { codeLike, phase, extensionInstalled } = req.query;
    const participantRepo = dataSource.getRepository(participant_1.default);
    const where = {
        code: (typeof codeLike === 'string') ? (0, typeorm_1.Like)(`%${codeLike}%`) : undefined,
        phase: (0, participant_1.isValidPhase)(Number(phase)) ? Number(phase) : undefined,
        extensionInstalled: translateExtensionInstalledFilter(extensionInstalled),
    };
    try {
        const participants = yield participantRepo
            .find({
            skip: page * pageSize,
            take: pageSize,
            order: {
                createdAt: 'DESC',
            },
            where,
        });
        const count = yield participantRepo.count({ where });
        const data = {
            results: participants,
            page,
            pageSize,
            pageCount: Math.ceil(count / pageSize),
            count,
        };
        res.status(200).json({ kind: 'Success', value: data });
    }
    catch (error) {
        log('Error getting participants', error);
        res.status(500).json({ kind: 'Error', message: 'Error getting participants' });
    }
});
exports.createGetParticipantsRoute = createGetParticipantsRoute;
exports.default = exports.createGetParticipantsRoute;
//# sourceMappingURL=getParticipants.js.map
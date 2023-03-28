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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostExperimentConfigRoute = void 0;
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const util_1 = require("../../common/util");
const createPostExperimentConfigRoute = ({ createLogger, dataSource }) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const log = createLogger(req.requestId);
    log('Received create experiment config request');
    if (req.adminId === undefined) {
        res.status(401).json({ kind: 'Failure', message: 'You must be logged in to create a configuration' });
        return;
    }
    const config = new experimentConfig_1.default();
    const _a = req.body, { id: _id, createdAt: _createdAt, updatedAt: _updatedAt } = _a, data = __rest(_a, ["id", "createdAt", "updatedAt"]);
    Object.assign(config, data);
    config.adminId = req.adminId;
    log('config received:', config);
    const errors = yield (0, util_1.validateNew)(config);
    if (errors.length > 0) {
        res.status(400).json({ kind: 'Failure', message: `${errors.join(', ')}` });
        return;
    }
    yield dataSource.transaction((transaction) => __awaiter(void 0, void 0, void 0, function* () {
        const repo = transaction.getRepository(experimentConfig_1.default);
        try {
            const currentConfig = yield repo.findOneBy({
                isCurrent: true,
            });
            if (currentConfig) {
                currentConfig.isCurrent = false;
                currentConfig.updatedAt = new Date();
                yield repo.save(currentConfig);
            }
            config.isCurrent = true;
            yield repo.save(config);
            res.status(200).json({ kind: 'Success', value: config });
        }
        catch (error) {
            log('Error while saving config:', error);
            res.status(500).json({ kind: 'Failure', message: 'An error occurred while saving the configuration' });
        }
    }));
});
exports.createPostExperimentConfigRoute = createPostExperimentConfigRoute;
exports.default = exports.createPostExperimentConfigRoute;
//# sourceMappingURL=postExperimentConfig.js.map
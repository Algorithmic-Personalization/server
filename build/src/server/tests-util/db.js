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
const postgres_migrations_1 = require("postgres-migrations");
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const pg_1 = require("pg");
const pgtools_1 = __importDefault(require("pgtools"));
const loadDbConfig_1 = __importDefault(require("../lib/config-loader/loadDbConfig"));
const entities_1 = __importDefault(require("../entities"));
const admin_1 = __importDefault(require("../../common/models/admin"));
const experimentConfig_1 = __importDefault(require("../../common/models/experimentConfig"));
const participant_1 = __importDefault(require("../models/participant"));
const event_1 = __importDefault(require("../../common/models/event"));
const session_1 = __importDefault(require("../../common/models/session"));
const transitionEvent_1 = __importStar(require("../models/transitionEvent"));
const transitionSetting_1 = __importStar(require("../../server/models/transitionSetting"));
const crypto_1 = require("../lib/crypto");
const shouldLogDb = () => { var _a, _b; return (_b = (_a = process.env.DEBUG) === null || _a === void 0 ? void 0 : _a.includes('db')) !== null && _b !== void 0 ? _b : false; };
const resetDb = (shortTimeout = false, logging = shouldLogDb()) => __awaiter(void 0, void 0, void 0, function* () {
    const dbConfig = yield (0, loadDbConfig_1.default)({
        environnement: 'test',
        useDockerAddress: false,
    });
    const { database: _ignored } = dbConfig, dbConfigWithoutDatabase = __rest(dbConfig, ["database"]);
    try {
        yield pgtools_1.default.dropdb(dbConfigWithoutDatabase, 'ytdpnl');
    }
    catch (e) {
        console.log('dropdb before tests failed, not necessarily an issue, it may not exist', e);
    }
    yield pgtools_1.default.createdb(dbConfigWithoutDatabase, 'ytdpnl');
    const client = new pg_1.Client(Object.assign({}, dbConfig));
    yield client.connect();
    yield (0, postgres_migrations_1.migrate)(dbConfig, dbConfig.migrationsDir);
    const extra = shortTimeout ? {
        options: '-c lock_timeout=500ms',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        statement_timeout: 500,
    } : {};
    const dataSource = new typeorm_1.DataSource(Object.assign(Object.assign({ type: 'postgres' }, dbConfig), { username: dbConfig.user, synchronize: false, entities: entities_1.default, namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(), logging, maxQueryExecutionTime: 200, extra }));
    yield dataSource.initialize();
    const createAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
        const admin = new admin_1.default();
        admin.email = 'test@example.com';
        admin.name = 'Test Admin';
        admin.password = 'password';
        admin.verificationToken = (0, crypto_1.randomToken)(128);
        admin.emailVerified = true;
        const repo = dataSource.getRepository(admin_1.default);
        const saved = yield repo.save(admin);
        return saved;
    });
    const admin = yield createAdmin();
    const createExperimentConfig = () => __awaiter(void 0, void 0, void 0, function* () {
        const experimentConfig = new experimentConfig_1.default();
        experimentConfig.adminId = admin.id;
        const repo = dataSource.getRepository(experimentConfig_1.default);
        const saved = yield repo.save(experimentConfig);
        return saved;
    });
    const experimentConfig = yield createExperimentConfig();
    const createParticipant = () => __awaiter(void 0, void 0, void 0, function* () {
        const participant = new participant_1.default();
        participant.code = (0, crypto_1.randomToken)(64);
        const repo = dataSource.getRepository(participant_1.default);
        const saved = yield repo.save(participant);
        return saved;
    });
    const createSession = (participant) => __awaiter(void 0, void 0, void 0, function* () {
        const session = new session_1.default();
        session.participantCode = participant.code;
        const repo = dataSource.getRepository(session_1.default);
        const saved = yield repo.save(session);
        return saved;
    });
    const createEvent = (session) => __awaiter(void 0, void 0, void 0, function* () {
        const event = new event_1.default();
        event.sessionUuid = session.uuid;
        event.experimentConfigId = experimentConfig.id;
        event.url = 'https://example.com';
        const repo = dataSource.getRepository(event_1.default);
        const saved = yield repo.save(event);
        return saved;
    });
    const createTransitionEvent = (p) => {
        const event = new transitionEvent_1.default();
        event.participantId = p.id;
        event.fromPhase = transitionSetting_1.Phase.PRE_EXPERIMENT;
        event.toPhase = transitionSetting_1.Phase.EXPERIMENT;
        event.reason = transitionEvent_1.TransitionReason.FORCED;
        return event;
    };
    const createTransitionSettings = () => __awaiter(void 0, void 0, void 0, function* () {
        const settings = new transitionSetting_1.default();
        settings.fromPhase = transitionSetting_1.Phase.PRE_EXPERIMENT;
        settings.toPhase = transitionSetting_1.Phase.EXPERIMENT;
        settings.isCurrent = true;
        const repo = dataSource.getRepository(transitionSetting_1.default);
        const saved = yield repo.save(settings);
        return saved;
    });
    const tearDown = () => __awaiter(void 0, void 0, void 0, function* () {
        yield client.end();
        yield dataSource.destroy();
    });
    return {
        dataSource,
        client,
        createParticipant,
        createSession,
        createEvent,
        createTransitionEvent,
        tearDown,
        createTransitionSettings,
    };
});
exports.default = resetDb;
//# sourceMappingURL=db.js.map
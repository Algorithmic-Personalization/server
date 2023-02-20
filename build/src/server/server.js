"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = require("path");
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var webpack_1 = __importDefault(require("webpack"));
var webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
var webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
var cors_1 = __importDefault(require("cors"));
var multer_1 = __importDefault(require("multer"));
var pg_1 = require("pg");
var typeorm_1 = require("typeorm");
var typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
var postgres_migrations_1 = require("postgres-migrations");
var yaml_1 = require("yaml");
var class_validator_1 = require("class-validator");
var nodemailer_1 = __importDefault(require("nodemailer"));
var util_1 = require("../common/util");
var admin_1 = __importDefault(require("../common/models/admin"));
var token_1 = __importDefault(require("./models/token"));
var participant_1 = __importDefault(require("./models/participant"));
var experimentConfig_1 = __importDefault(require("../common/models/experimentConfig"));
var session_1 = __importDefault(require("../common/models/session"));
var event_1 = __importDefault(require("../common/models/event"));
var video_1 = __importDefault(require("./models/video"));
var watchTime_1 = __importDefault(require("./models/watchTime"));
var videoListItem_1 = __importDefault(require("./models/videoListItem"));
var smtpConfig_1 = __importDefault(require("./lib/smtpConfig"));
var webpack_config_1 = __importDefault(require("../../webpack.config"));
var logger_1 = require("./lib/logger");
var crypto_1 = require("./lib/crypto");
var authMiddleware_1 = __importDefault(require("./lib/authMiddleware"));
var participantMiddleware_1 = __importDefault(require("./lib/participantMiddleware"));
var routes_1 = require("../common/routes");
var serverRoutes_1 = require("./serverRoutes");
var register_1 = __importDefault(require("./api/register"));
var verifyEmail_1 = __importDefault(require("./api/verifyEmail"));
var login_1 = __importDefault(require("./api/login"));
var createApiToken_1 = __importDefault(require("./api/createApiToken"));
var deleteApiToken_1 = __importDefault(require("./api/deleteApiToken"));
var getApiTokens_1 = __importDefault(require("./api/getApiTokens"));
var authTest_1 = __importDefault(require("./api/authTest"));
var uploadParticipants_1 = __importDefault(require("./api/uploadParticipants"));
var getParticipants_1 = __importDefault(require("./api/getParticipants"));
var getParticipantOverview_1 = __importDefault(require("./api/getParticipantOverview"));
var getEventOverviews_1 = __importDefault(require("./api/getEventOverviews"));
var getExperimentConfig_1 = __importDefault(require("./api/getExperimentConfig"));
var postExperimentConfig_1 = __importDefault(require("./api/postExperimentConfig"));
var getExperimentConfigHistory_1 = __importDefault(require("./api/getExperimentConfigHistory"));
var checkParticipantCode_1 = __importDefault(require("./api/checkParticipantCode"));
var createSession_1 = __importDefault(require("./api/createSession"));
var participantConfig_1 = __importDefault(require("./api/participantConfig"));
var postEvent_1 = __importDefault(require("./api/postEvent"));
var getEvents_1 = __importDefault(require("./api/getEvents"));
// Add classes used by typeorm as models here
// so that typeorm can extract the metadata from them.
var entities = [
    admin_1["default"],
    token_1["default"],
    participant_1["default"],
    experimentConfig_1["default"],
    session_1["default"],
    event_1["default"],
    video_1["default"],
    videoListItem_1["default"],
    watchTime_1["default"],
];
var env = process.env.NODE_ENV;
if (env !== 'production' && env !== 'development') {
    throw new Error('NODE_ENV must be set to "production" or "development"');
}
var upload = (0, multer_1["default"])();
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    var root, logsPath, logStream, configJson, config, dockerComposeJson, dockerComposeConfig, smtpConfig, smtpConfigErrors, mailer, portKey, port, dbPortString, _a, dbHostPort, dbDockerPort, dbPort, dbConfigPath, dbHost, dbUser, dbPassword, dbDatabase, dbConfig, pgClient, err_1, migrated, err_2, ds, err_3, createLogger, privateKey, tokenTools, routeContext, tokenRepo, authMiddleware, participantMw, app, staticRouter, compiler, requestId;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, util_1.findPackageJsonDir)(__dirname)];
            case 1:
                root = _b.sent();
                logsPath = (0, path_1.join)(root, 'logs', 'server.log');
                logStream = (0, fs_1.createWriteStream)(logsPath, { flags: 'a' });
                console.log('Package root is:', root);
                return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(root, 'config.yaml'), 'utf-8')];
            case 2:
                configJson = _b.sent();
                config = (0, yaml_1.parse)(configJson);
                return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(root, 'docker-compose.yaml'), 'utf-8')];
            case 3:
                dockerComposeJson = _b.sent();
                dockerComposeConfig = (0, yaml_1.parse)(dockerComposeJson);
                if (!config || typeof config !== 'object') {
                    throw new Error('Invalid config.yml');
                }
                if (!(0, util_1.has)('smtp')(config)) {
                    throw new Error('Missing smtp config in config.yml');
                }
                smtpConfig = new smtpConfig_1["default"]();
                Object.assign(smtpConfig, config.smtp);
                return [4 /*yield*/, (0, class_validator_1.validate)(smtpConfig)];
            case 4:
                smtpConfigErrors = _b.sent();
                if (smtpConfigErrors.length > 0) {
                    console.error('Invalid smtp config in config.yml', smtpConfigErrors);
                    process.exit(1);
                }
                mailer = nodemailer_1["default"].createTransport(smtpConfig);
                console.log('Mailer created:', mailer.transporter.name);
                if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
                    throw new Error('Invalid docker-compose.yaml');
                }
                portKey = "".concat(env, "-server-port");
                port = (0, util_1.getInteger)([portKey])(config);
                dbPortString = (0, util_1.getString)(['services', "".concat(env, "-db"), 'ports', '0'])(dockerComposeConfig);
                _a = __read(dbPortString.split(':'), 2), dbHostPort = _a[0], dbDockerPort = _a[1];
                dbPort = env === 'development' ? Number(dbHostPort) : Number(dbDockerPort);
                if (!dbPort || !Number.isInteger(dbPort)) {
                    throw new Error("Invalid db port: ".concat(dbPort));
                }
                dbConfigPath = ['services', "".concat(env, "-db"), 'environment'];
                dbHost = env === 'development' ? 'localhost' : "".concat(env, "-db");
                dbUser = (0, util_1.getString)(__spreadArray(__spreadArray([], __read(dbConfigPath), false), ['POSTGRES_USER'], false))(dockerComposeConfig);
                dbPassword = (0, util_1.getString)(__spreadArray(__spreadArray([], __read(dbConfigPath), false), ['POSTGRES_PASSWORD'], false))(dockerComposeConfig);
                dbDatabase = (0, util_1.getString)(__spreadArray(__spreadArray([], __read(dbConfigPath), false), ['POSTGRES_DB'], false))(dockerComposeConfig);
                dbConfig = {
                    host: dbHost,
                    port: dbPort,
                    user: dbUser,
                    password: dbPassword,
                    database: dbDatabase
                };
                pgClient = new pg_1.Client(dbConfig);
                _b.label = 5;
            case 5:
                _b.trys.push([5, 7, , 8]);
                return [4 /*yield*/, pgClient.connect()];
            case 6:
                _b.sent();
                return [3 /*break*/, 8];
            case 7:
                err_1 = _b.sent();
                console.error('Error connecting to the database with config', dbConfig, ':', err_1, 'is the db server running?');
                process.exit(1);
                return [3 /*break*/, 8];
            case 8:
                _b.trys.push([8, 10, , 11]);
                return [4 /*yield*/, (0, postgres_migrations_1.migrate)({ client: pgClient }, (0, path_1.join)(root, 'migrations'))];
            case 9:
                migrated = _b.sent();
                console.log('Successfully ran migrations:', migrated);
                return [3 /*break*/, 11];
            case 10:
                err_2 = _b.sent();
                console.error('Error running migrations:', err_2);
                process.exit(1);
                return [3 /*break*/, 11];
            case 11: return [4 /*yield*/, pgClient.end()];
            case 12:
                _b.sent();
                ds = new typeorm_1.DataSource(__assign(__assign({ type: 'postgres' }, dbConfig), { username: dbUser, synchronize: false, entities: entities, namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy() }));
                _b.label = 13;
            case 13:
                _b.trys.push([13, 15, , 16]);
                return [4 /*yield*/, ds.initialize()];
            case 14:
                _b.sent();
                return [3 /*break*/, 16];
            case 15:
                err_3 = _b.sent();
                console.error('Error initializing data source:', err_3);
                process.exit(1);
                return [3 /*break*/, 16];
            case 16:
                console.log('Successfully initialized data source');
                createLogger = (0, logger_1.createDefaultLogger)(logStream);
                return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(root, 'private.key'), 'utf-8')];
            case 17:
                privateKey = _b.sent();
                tokenTools = (0, crypto_1.createTokenTools)(privateKey);
                routeContext = {
                    dataSource: ds,
                    mailer: mailer,
                    mailerFrom: smtpConfig.auth.user,
                    createLogger: createLogger,
                    tokenTools: tokenTools
                };
                tokenRepo = ds.getRepository(token_1["default"]);
                authMiddleware = (0, authMiddleware_1["default"])({
                    tokenRepo: tokenRepo,
                    tokenTools: tokenTools,
                    createLogger: createLogger
                });
                participantMw = (0, participantMiddleware_1["default"])(createLogger);
                app = (0, express_1["default"])();
                staticRouter = express_1["default"].Router();
                if (env === 'development') {
                    compiler = (0, webpack_1["default"])(webpack_config_1["default"]);
                    if (!webpack_config_1["default"].output) {
                        throw new Error('Invalid webpack config, missing output path');
                    }
                    staticRouter.use((0, webpack_dev_middleware_1["default"])(compiler));
                    staticRouter.use((0, webpack_hot_middleware_1["default"])(compiler));
                }
                staticRouter.use(express_1["default"].static((0, path_1.join)(root, 'public')));
                app.use(staticRouter);
                app.use(body_parser_1["default"].json());
                app.use((0, cors_1["default"])());
                requestId = 0;
                app.use(function (req, _res, next) {
                    ++requestId;
                    req.requestId = requestId;
                    createLogger(req.requestId)(req.method, req.url);
                    next();
                });
                app.post(routes_1.postRegister, (0, register_1["default"])(routeContext));
                app.get(routes_1.getVerifyEmailToken, (0, verifyEmail_1["default"])(routeContext));
                app.post(routes_1.postLogin, (0, login_1["default"])(routeContext));
                app.get(serverRoutes_1.getApiTokens, authMiddleware, (0, getApiTokens_1["default"])(routeContext));
                app.post(serverRoutes_1.createApiToken, authMiddleware, (0, createApiToken_1["default"])(routeContext));
                app["delete"](serverRoutes_1.deleteApiToken, authMiddleware, (0, deleteApiToken_1["default"])(routeContext));
                app.get(routes_1.getAuthTest, authMiddleware, (0, authTest_1["default"])(routeContext));
                app.post(routes_1.postUploadParticipants, authMiddleware, upload.single('participants'), (0, uploadParticipants_1["default"])(routeContext));
                app.get("".concat(routes_1.getParticipants, "/:page?"), authMiddleware, (0, getParticipants_1["default"])(routeContext));
                app.get("".concat(routes_1.getParticipantOverview, "/:email"), authMiddleware, (0, getParticipantOverview_1["default"])(routeContext));
                app.get("".concat(routes_1.getEventOverviews, "/:sessionUuid"), authMiddleware, (0, getEventOverviews_1["default"])(routeContext));
                app.get(routes_1.getExperimentConfig, authMiddleware, (0, getExperimentConfig_1["default"])(routeContext));
                app.post(routes_1.postExperimentConfig, authMiddleware, (0, postExperimentConfig_1["default"])(routeContext));
                app.get(routes_1.getExperimentConfigHistory, authMiddleware, (0, getExperimentConfigHistory_1["default"])(routeContext));
                app.get("".concat(routes_1.getEvents, "/:page?"), authMiddleware, (0, getEvents_1["default"])(routeContext));
                app.post(routes_1.postCheckParticipantCode, (0, checkParticipantCode_1["default"])(routeContext));
                app.post(routes_1.postCreateSession, participantMw, (0, createSession_1["default"])(routeContext));
                app.get(routes_1.getParticipantConfig, participantMw, (0, participantConfig_1["default"])(routeContext));
                app.post(routes_1.postEvent, participantMw, (0, postEvent_1["default"])(routeContext));
                app.use(function (req, res, next) {
                    var _a;
                    if (req.method === 'GET' && ((_a = req.headers.accept) === null || _a === void 0 ? void 0 : _a.startsWith('text/html'))) {
                        res.sendFile((0, path_1.join)(root, 'public', 'index.html'));
                        return;
                    }
                    next();
                });
                app.listen(port, '0.0.0.0', function () {
                    console.log("Server in \"".concat(env, "\" mode listening on port ").concat(port));
                });
                return [2 /*return*/];
        }
    });
}); };
start()["catch"](function (err) {
    console.error(err);
    process.exit(1);
});

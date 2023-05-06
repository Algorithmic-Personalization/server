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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _RateLimiter_sleepTimes, _RateLimiter_sleepIndex, _RateLimiter_maxAttemptsAtMaxSleep, _RateLimiter_attemptsAtMaxSleepLeft, _RateLimiter_baseDelay;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = exports.keypress = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const yaml_1 = require("yaml");
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const util_1 = require("../common/util");
const util_2 = require("../util");
const getYouTubeConfig_1 = __importDefault(require("../server/lib/config-loader/getYouTubeConfig"));
const youTubeApi_1 = __importDefault(require("../server/lib/youTubeApi"));
const entities_1 = __importDefault(require("../server/entities"));
const databaseLogger_1 = __importDefault(require("../server/lib/databaseLogger"));
const logger_1 = require("../server/lib/logger");
const scrapeYouTube_1 = __importDefault(require("../server/lib/scrapeYouTube"));
const commands = new Map([
    ['compare', 'will compare the categories set of different regions'],
    ['scrape', 'will scrape meta-data for all the videos we don\'t have yet'],
]);
const commandsNeedingDataSource = new Set(['scrape']);
const env = () => {
    const env = process.env.NODE_ENV;
    if (env === 'production') {
        return 'production';
    }
    process.env.node_env = 'development';
    return 'development';
};
const keypress = () => __awaiter(void 0, void 0, void 0, function* () {
    process.stdin.setRawMode(true);
    return new Promise(resolve => {
        process.stdin.once('data', d => {
            process.stdin.setRawMode(false);
            resolve(d.toString('utf-8'));
        });
    });
});
exports.keypress = keypress;
class RateLimiter {
    constructor(log) {
        this.log = log;
        _RateLimiter_sleepTimes.set(this, [0, 100, 200, 400, 800, 1600, 3200, 6400, 12800]);
        _RateLimiter_sleepIndex.set(this, 0);
        _RateLimiter_maxAttemptsAtMaxSleep.set(this, 5);
        _RateLimiter_attemptsAtMaxSleepLeft.set(this, void 0);
        _RateLimiter_baseDelay.set(this, 100);
        __classPrivateFieldSet(this, _RateLimiter_attemptsAtMaxSleepLeft, __classPrivateFieldGet(this, _RateLimiter_maxAttemptsAtMaxSleep, "f"), "f");
    }
    sleep(latestCallWasSuccessful) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_2.sleep)(__classPrivateFieldGet(this, _RateLimiter_baseDelay, "f"));
            if (latestCallWasSuccessful) {
                __classPrivateFieldSet(this, _RateLimiter_attemptsAtMaxSleepLeft, __classPrivateFieldGet(this, _RateLimiter_maxAttemptsAtMaxSleep, "f"), "f");
                if (__classPrivateFieldGet(this, _RateLimiter_sleepIndex, "f") > 0) {
                    __classPrivateFieldSet(this, _RateLimiter_sleepIndex, (_a = __classPrivateFieldGet(this, _RateLimiter_sleepIndex, "f"), --_a), "f");
                }
            }
            else if (__classPrivateFieldGet(this, _RateLimiter_sleepIndex, "f") < __classPrivateFieldGet(this, _RateLimiter_sleepTimes, "f").length - 1) {
                __classPrivateFieldSet(this, _RateLimiter_sleepIndex, (_b = __classPrivateFieldGet(this, _RateLimiter_sleepIndex, "f"), ++_b), "f");
            }
            else if (__classPrivateFieldGet(this, _RateLimiter_attemptsAtMaxSleepLeft, "f") > 0) {
                __classPrivateFieldSet(this, _RateLimiter_attemptsAtMaxSleepLeft, (_c = __classPrivateFieldGet(this, _RateLimiter_attemptsAtMaxSleepLeft, "f"), --_c), "f");
            }
            const t = this.getSleepTime();
            if (t > 0) {
                this.log('warning', `we're probably being rate-limited, sleeping for ${t} ms`);
                yield (0, util_2.sleep)(t);
                return t;
            }
            return 0;
        });
    }
    getSleepTime() {
        return __classPrivateFieldGet(this, _RateLimiter_sleepTimes, "f")[__classPrivateFieldGet(this, _RateLimiter_sleepIndex, "f")];
    }
    isStuck() {
        return __classPrivateFieldGet(this, _RateLimiter_attemptsAtMaxSleepLeft, "f") === 0;
    }
}
exports.RateLimiter = RateLimiter;
_RateLimiter_sleepTimes = new WeakMap(), _RateLimiter_sleepIndex = new WeakMap(), _RateLimiter_maxAttemptsAtMaxSleep = new WeakMap(), _RateLimiter_attemptsAtMaxSleepLeft = new WeakMap(), _RateLimiter_baseDelay = new WeakMap();
// TODO: move this to a separate file, use in in server.ts because it
// is duplicated there and it is ugly in server.ts
const createDataSource = (projectRootDir, log) => __awaiter(void 0, void 0, void 0, function* () {
    const dockerComposeJson = yield (0, promises_1.readFile)((0, path_1.join)(projectRootDir, 'docker-compose.yaml'), 'utf-8');
    const dockerComposeConfig = (0, yaml_1.parse)(dockerComposeJson);
    if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
        throw new Error('Invalid docker-compose.yaml');
    }
    const insideDocker = process.env.INSIDE_DOCKER === 'true';
    const outsideDocker = !insideDocker;
    log(`we are running ${outsideDocker ? 'outside' : 'inside'} docker in ${env()} mode`);
    const dbPortString = (0, util_1.getString)(['services', `${env()}-db`, 'ports', '0'])(dockerComposeConfig);
    const [dbHostPort, dbDockerPort] = dbPortString.split(':');
    const dbPort = outsideDocker ? Number(dbHostPort) : Number(dbDockerPort);
    if (!dbPort || !Number.isInteger(dbPort)) {
        throw new Error(`Invalid db port: ${dbPort}`);
    }
    const dbConfigPath = ['services', `${env()}-db`, 'environment'];
    const dbHost = outsideDocker ? 'localhost' : `${env()}-db`;
    const dbUser = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_USER'])(dockerComposeConfig);
    const dbPassword = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_PASSWORD'])(dockerComposeConfig);
    const dbDatabase = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_DB'])(dockerComposeConfig);
    const dbConfig = {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbDatabase,
    };
    const dbConfigForLog = Object.assign(Object.assign({}, dbConfig), { password: '<masked>' });
    log('info', 'dbConfig:', dbConfigForLog);
    const ds = new typeorm_1.DataSource(Object.assign(Object.assign({ type: 'postgres' }, dbConfig), { username: dbUser, synchronize: false, entities: entities_1.default, namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(), 
        // D logging: true,
        logger: new databaseLogger_1.default(log) }));
    yield ds.initialize();
    return ds;
});
const compareCategoriesOfTwoRegions = (regionA, regionB, log, api) => __awaiter(void 0, void 0, void 0, function* () {
    const [categoriesA, categoriesB] = yield Promise.all([
        api.getCategoriesFromRegionCode(regionA),
        api.getCategoriesFromRegionCode(regionB),
    ]);
    const toMap = (categories) => {
        const map = new Map();
        for (const category of categories) {
            map.set(category.id, category);
        }
        return map;
    };
    const mapA = toMap(categoriesA);
    const mapB = toMap(categoriesB);
    if (mapA.size !== mapB.size) {
        log(`Categories of ${regionA} and ${regionB} differ in size,`, `region ${regionA} has ${mapA.size} categories,`, `while region ${regionB} has ${mapB.size} categories.`);
    }
    for (const [id, categoryA] of mapA) {
        const categoryB = mapB.get(id);
        if (!categoryB) {
            log(`Category ${categoryA.snippet.title} (${id})`, `is only available in region ${regionA},`, `but not in region ${regionB}.`);
        }
    }
    for (const [id, categoryB] of mapB) {
        const categoryA = mapA.get(id);
        if (!categoryA) {
            log(`Category ${categoryB.snippet.title} (${id})`, `is only available in region ${regionB},`, `but not in region ${regionA}.`);
        }
    }
    for (const [id, categoryA] of mapA) {
        const categoryB = mapB.get(id);
        if (!categoryB) {
            continue;
        }
        if (categoryA.snippet.title !== categoryB.snippet.title) {
            log(`Category ${categoryA.snippet.title} (${id})`, `is called ${categoryB.snippet.title} in region ${regionB}.`);
        }
    }
});
const compareSomeCategoriesWithUs = (log, api) => __awaiter(void 0, void 0, void 0, function* () {
    const regionA = 'US';
    const regionBs = ['FR', 'DE', 'GB', 'CA', 'AU', 'IT', 'JP', 'GR'];
    for (const regionB of regionBs) {
        // eslint-disable-next-line no-await-in-loop
        yield compareCategoriesOfTwoRegions(regionA, regionB, log, api);
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const cmd = process.argv[2];
    const root = yield (0, util_1.findPackageJsonDir)(__dirname);
    const createLog = (0, logger_1.makeCreateDefaultLogger)((0, fs_1.createWriteStream)((0, path_1.join)(root, `${(0, path_1.basename)(__filename)}.log`), {
        flags: 'a',
    }));
    const log = createLog('<main>');
    if (!commands.has(cmd)) {
        log('Please provide a command, one of:');
        for (const [cmd, desc] of commands) {
            log(`  ${cmd}: ${desc}`);
        }
        process.exit(1);
    }
    const configJson = yield (0, promises_1.readFile)((0, path_1.join)(root, 'config.yaml'), 'utf-8');
    const config = (0, yaml_1.parse)(configJson);
    const youTubeConfig = (0, getYouTubeConfig_1.default)(config);
    const createApiWithCache = (0, youTubeApi_1.default)('with-cache');
    const createApiWithoutCache = (0, youTubeApi_1.default)('without-cache');
    const dataSourceNeeded = commandsNeedingDataSource.has(cmd);
    const dataSource = dataSourceNeeded
        ? yield createDataSource(root, log)
        : undefined;
    if (dataSourceNeeded && !dataSource) {
        console.error('The command"', cmd, '" needs a dataSource,', 'so you will need to customize docker-compose.yaml', 'to your needs');
        process.exit(1);
    }
    const apiWithCache = createApiWithCache(youTubeConfig, createLog('<yt-cached-api>'), dataSource);
    const apiWithoutCache = createApiWithoutCache(youTubeConfig, createLog('<yt-uncached-api>'), dataSource);
    if (cmd === 'compare') {
        log('Running compare...');
        yield compareSomeCategoriesWithUs(createLog('<compare>'), apiWithCache);
    }
    else if (cmd === 'scrape') {
        console.log('Running scrape...');
        if (!dataSource) {
            throw new Error('dataSource is undefined');
        }
        try {
            const scrapeLog = createLog('<scrape>');
            // Use API without memory cache to minimize RAM usage on low-perf server
            yield (0, scrapeYouTube_1.default)(dataSource, scrapeLog, apiWithoutCache);
        }
        catch (err) {
            console.error('Error while scraping:', err);
        }
    }
    else {
        log('Unknown command', cmd);
        log('Try one of:');
        for (const [cmd, desc] of commands) {
            log(`  ${cmd}: ${desc}`);
        }
        process.exit(1);
    }
    process.exit(0);
});
main().catch(console.error);
//# sourceMappingURL=youTubeApiCategoriesExploration.js.map
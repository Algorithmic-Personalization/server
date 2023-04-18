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
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const yaml_1 = require("yaml");
const typeorm_1 = require("typeorm");
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const util_1 = require("../common/util");
const getYouTubeConfig_1 = __importDefault(require("../server/lib/config-loader/getYouTubeConfig"));
const youTubeApi_1 = __importDefault(require("../server/lib/youTubeApi"));
const entities_1 = __importDefault(require("../server/entities"));
// D import DatabaseLogger from '../server/lib/databaseLogger';
const logger_1 = require("../server/lib/logger");
const video_1 = __importDefault(require("../server/models/video"));
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
const scrape = (dataSource, log, api) => __awaiter(void 0, void 0, void 0, function* () {
    log('gonna scrape!');
    const query = dataSource
        .getRepository(video_1.default)
        .createQueryBuilder('v')
        .select('v.youtube_id')
        .where('not exists (select 1 from video_metadata m where m.youtube_Id = v.youtube_Id)');
    log('running query: ', query.getSql());
    const youtubeIdsWithoutMetadata = yield query.getRawMany();
    log('youtubeIds needing fetching the meta-data for:', youtubeIdsWithoutMetadata.length);
    const pagesToFetch = [];
    const idsPerRequest = 50;
    let pos = 0;
    for (; pos + idsPerRequest < youtubeIdsWithoutMetadata.length; ++pos) {
        pagesToFetch.push(youtubeIdsWithoutMetadata.slice(pos, pos + 50).map(x => x.youtube_id));
    }
    if (pos < youtubeIdsWithoutMetadata.length) {
        pagesToFetch.push(youtubeIdsWithoutMetadata.slice(pos).map(x => x.youtube_id));
    }
    for (const page of pagesToFetch) {
        // eslint-disable-next-line no-await-in-loop
        const meta = yield api.getMetaFromVideoIds(page);
        const { data } = meta, stats = __rest(meta, ["data"]);
        log('got meta-data for', data.size, 'videos with stats:', stats);
    }
    log('done!');
});
// TODO: move this to a separate file, use in in server.ts because it
// is duplicated there and it is ugly in server.ts
const createDataSource = (projectRootDir, log) => __awaiter(void 0, void 0, void 0, function* () {
    const dockerComposeJson = yield (0, promises_1.readFile)((0, path_1.join)(projectRootDir, 'docker-compose.yaml'), 'utf-8');
    const dockerComposeConfig = (0, yaml_1.parse)(dockerComposeJson);
    if (!dockerComposeConfig || typeof dockerComposeConfig !== 'object') {
        throw new Error('Invalid docker-compose.yaml');
    }
    const outsideDocker = process.env.OUTSIDE_DOCKER !== 'false';
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
    const ds = new typeorm_1.DataSource(Object.assign(Object.assign({ type: 'postgres' }, dbConfig), { username: dbUser, synchronize: false, entities: entities_1.default, namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy() }));
    yield ds.initialize();
    return ds;
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const cmd = process.argv[2];
    const root = yield (0, util_1.findPackageJsonDir)(__dirname);
    const createLog = (0, logger_1.makeCreateDefaultLogger)((0, fs_1.createWriteStream)((0, path_1.join)(root, `${(0, path_1.basename)(__filename)}.log`)));
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
    const createApi = (0, youTubeApi_1.default)();
    const dataSourceNeeded = commandsNeedingDataSource.has(cmd);
    const dataSource = dataSourceNeeded
        ? yield createDataSource(root, log)
        : undefined;
    if (dataSourceNeeded && !dataSource) {
        console.error('The command"', cmd, '" needs a dataSource,', 'so you will need to customize docker-compose.yaml', 'to your needs');
        process.exit(1);
    }
    const api = createApi(youTubeConfig, createLog('<yt-api>'), dataSource);
    const compareCategoriesOfTwoRegions = (regionA, regionB) => __awaiter(void 0, void 0, void 0, function* () {
        const log = createLog('<compare-categories>');
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
    const compareSomeCategoriesWithUs = () => __awaiter(void 0, void 0, void 0, function* () {
        const regionA = 'US';
        const regionBs = ['FR', 'DE', 'GB', 'CA', 'AU', 'IT', 'JP', 'GR'];
        for (const regionB of regionBs) {
            // eslint-disable-next-line no-await-in-loop
            yield compareCategoriesOfTwoRegions(regionA, regionB);
        }
    });
    if (cmd === 'compare') {
        console.log('Running compare...');
        yield compareSomeCategoriesWithUs();
    }
    else if (cmd === 'scrape') {
        console.log('Running scrape...');
        if (!dataSource) {
            throw new Error('dataSource is undefined');
        }
        try {
            const scrapeLog = createLog('<scrape>');
            yield scrape(dataSource, scrapeLog, api);
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
});
main().catch(console.error);
//# sourceMappingURL=youTubeApiCategoriesExploration.js.map
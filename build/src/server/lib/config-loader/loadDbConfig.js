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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDatabaseConfig = void 0;
const path_1 = require("path");
const util_1 = require("../../../common/util");
const promises_1 = require("fs/promises");
const yaml_1 = require("yaml");
const loadDatabaseConfig = (configType, projectRoot) => __awaiter(void 0, void 0, void 0, function* () {
    const root = projectRoot !== null && projectRoot !== void 0 ? projectRoot : yield (0, util_1.findPackageJsonDir)(__dirname);
    const dockerComposePath = (0, path_1.join)(root, 'docker-compose.yaml');
    const dockerComposeYaml = yield (0, promises_1.readFile)(dockerComposePath, 'utf-8');
    const dockerComposeConfig = (0, yaml_1.parse)(dockerComposeYaml);
    const env = configType.environnement;
    const dbConfigPath = ['services', `${env}-db`, 'environment'];
    const host = configType.useDockerAddress ? `${env}-db` : 'localhost';
    const user = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_USER'])(dockerComposeConfig);
    const password = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_PASSWORD'])(dockerComposeConfig);
    const database = (0, util_1.getString)([...dbConfigPath, 'POSTGRES_DB'])(dockerComposeConfig);
    const dbPortString = (0, util_1.getString)(['services', `${env}-db`, 'ports', '0'])(dockerComposeConfig);
    const [dbHostPort, dbDockerPort] = dbPortString.split(':');
    const port = configType.useDockerAddress ? Number(dbDockerPort) : Number(dbHostPort);
    if (!port || !Number.isInteger(port)) {
        throw new Error(`Invalid db port: ${port}`);
    }
    return {
        host,
        port,
        user,
        password,
        database,
        migrationsDir: (0, path_1.join)(root, 'migrations'),
    };
});
exports.loadDatabaseConfig = loadDatabaseConfig;
exports.default = exports.loadDatabaseConfig;
//# sourceMappingURL=loadDbConfig.js.map
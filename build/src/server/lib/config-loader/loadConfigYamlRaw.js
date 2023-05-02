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
exports.loadConfigYamlRaw = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
const yaml_1 = require("yaml");
const util_1 = require("../../../common/util");
const loadConfigYamlRaw = () => __awaiter(void 0, void 0, void 0, function* () {
    const root = yield (0, util_1.findPackageJsonDir)(__dirname);
    const path = (0, path_1.join)(root, 'config.yaml');
    const configJson = yield (0, promises_1.readFile)(path, 'utf-8');
    const config = (0, yaml_1.parse)(configJson);
    if (typeof config !== 'object' || !config) {
        throw new Error(`invalid config, object expected in ${path}`);
    }
    return config;
});
exports.loadConfigYamlRaw = loadConfigYamlRaw;
exports.default = exports.loadConfigYamlRaw;
//# sourceMappingURL=loadConfigYamlRaw.js.map
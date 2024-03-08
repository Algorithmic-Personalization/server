"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseLogger = void 0;
const typeorm_1 = require("typeorm");
const PlatformTools_1 = require("typeorm/platform/PlatformTools");
const util_1 = require("util");
class DatabaseLogger extends typeorm_1.AbstractLogger {
    constructor(logger, slowQueryMeter) {
        super();
        this.logger = logger;
        this.slowQueryMeter = slowQueryMeter;
    }
    logQuerySlow(time, query, parameters, _queryRunner) {
        var _a;
        this.logger('/!\\ Query is slow /!\\ time:', time, 'query:', PlatformTools_1.PlatformTools.highlightSql(query), 'parameters:', parameters ? (0, util_1.inspect)(parameters) : '');
        (_a = this.slowQueryMeter) === null || _a === void 0 ? void 0 : _a.mark();
    }
    writeLog(level, message) {
        this.logger(level, message);
    }
}
exports.DatabaseLogger = DatabaseLogger;
exports.default = DatabaseLogger;
//# sourceMappingURL=databaseLogger.js.map
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
exports.makeRouteConnector = void 0;
const JSONStream_1 = __importDefault(require("JSONStream"));
const util_1 = require("../../common/util");
const notFoundError_1 = __importDefault(require("./notFoundError"));
const hasMessage = (0, util_1.has)('message');
const msg = (x) => (hasMessage(x) ? x.message : 'An unknown error occurred');
const isStream = (x) => {
    if (typeof x !== 'object' || x === null) {
        return false;
    }
    if (typeof x.pipe !== 'function') {
        return false;
    }
    return true;
};
/* D
const drain = (stream: ReadStream) => ({
    into(res: Response) {
        stream.on('data', chunk => {
            console.log('chunk', chunk);
            res.write(
                typeof chunk === 'string'
                    ? chunk
                    : JSON.stringify(chunk),
            );
        });
    },
});
*/
const makeRouteConnector = (context) => (definition) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { makeHandler } = definition;
    const { createLogger } = context;
    const log = createLogger(req.requestId);
    const handler = makeHandler(context);
    try {
        const value = yield handler(req);
        if (isStream(value)) {
            value.pipe(JSONStream_1.default.stringify()).pipe(res);
            return;
        }
        res.json({
            kind: 'Success',
            value,
        });
    }
    catch (err) {
        if (err instanceof notFoundError_1.default) {
            res.status(404).json({
                kind: 'Failure',
                message: msg(err),
            });
            return;
        }
        const message = msg(err);
        log('error', message, err);
        res.status(500).json({
            kind: 'Failure',
            message,
        });
    }
});
exports.makeRouteConnector = makeRouteConnector;
//# sourceMappingURL=routeCreation.js.map
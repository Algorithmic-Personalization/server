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
const util_1 = require("../../common/util");
const notFoundError_1 = __importDefault(require("./notFoundError"));
const hasMessage = (0, util_1.has)('message');
const message = (x) => (hasMessage(x) ? x.message : 'An unknown error occurred');
const makeRouteConnector = (context) => (definition) => (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { makeHandler } = definition;
    const handler = makeHandler(context);
    try {
        const value = yield handler(req);
        res.json({
            kind: 'Success',
            value,
        });
    }
    catch (err) {
        if (err instanceof notFoundError_1.default) {
            res.status(404).json({
                kind: 'Failure',
                message: message(err),
            });
            return;
        }
        res.status(500).json({
            kind: 'Failure',
            message: message(err),
        });
    }
});
exports.makeRouteConnector = makeRouteConnector;
//# sourceMappingURL=routeCreation.js.map
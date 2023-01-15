"use strict";
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
var path_1 = __importDefault(require("path"));
var webpack_1 = __importDefault(require("webpack"));
var react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
var mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
var isDevelopment = mode === 'development';
var entry = isDevelopment ? ['webpack-hot-middleware/client'] : [];
console.log('Entry:', entry);
var conf = {
    mode: mode,
    entry: __spreadArray(__spreadArray([], __read(entry), false), ['./src/server-app/index.tsx'], false),
    output: {
        filename: 'bundle.js',
        path: path_1["default"].resolve(__dirname, 'public'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            'react-native-sqlite-storage': false,
            path: false,
            fs: false,
            assert: false,
            process: false
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.csv$/,
                type: 'asset/source'
            },
        ]
    },
    devtool: 'source-map',
    plugins: [
        isDevelopment && new webpack_1["default"].HotModuleReplacementPlugin(),
        isDevelopment && new react_refresh_webpack_plugin_1["default"](),
        new webpack_1["default"].EnvironmentPlugin(['NODE_ENV']),
    ].filter(Boolean)
};
exports["default"] = conf;

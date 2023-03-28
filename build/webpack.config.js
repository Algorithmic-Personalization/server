"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const react_refresh_webpack_plugin_1 = __importDefault(require("@pmmmwh/react-refresh-webpack-plugin"));
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const isDevelopment = mode === 'development';
const entry = isDevelopment ? ['webpack-hot-middleware/client'] : [];
console.log('Entry:', entry);
const conf = {
    mode,
    entry: [...entry, './src/server-app/index.tsx'],
    output: {
        filename: 'bundle.js',
        path: path_1.default.resolve(__dirname, 'public'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        fallback: {
            'react-native-sqlite-storage': false,
            path: false,
            fs: false,
            assert: false,
            process: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.csv$/,
                type: 'asset/source',
            },
        ],
    },
    devtool: 'source-map',
    plugins: [
        isDevelopment && new webpack_1.default.HotModuleReplacementPlugin(),
        isDevelopment && new react_refresh_webpack_plugin_1.default(),
        new webpack_1.default.EnvironmentPlugin(['NODE_ENV']),
    ].filter(Boolean),
};
exports.default = conf;
//# sourceMappingURL=webpack.config.js.map
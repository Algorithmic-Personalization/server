import path from 'path';

import webpack from 'webpack';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const isDevelopment = mode === 'development';

const entry = isDevelopment ? ['webpack-hot-middleware/client'] : [];

console.log('Entry:', entry);

const conf: webpack.Configuration = {
	mode,
	entry: [...entry, './src/server-app/index.tsx'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public'),
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
			stream: require.resolve('stream-browserify'),
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
		isDevelopment && new webpack.HotModuleReplacementPlugin(),
		isDevelopment && new ReactRefreshWebpackPlugin(),
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new webpack.ProvidePlugin({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Buffer: ['buffer', 'Buffer'],
		}),
	].filter(Boolean) as webpack.WebpackPluginInstance[],
};

export default conf;

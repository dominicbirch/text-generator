
// @ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/
const { default: BundleDeclarationsWebpackPlugin } = require('bundle-declarations-webpack-plugin');
const path = require('path'), { name: packageName } = require("./package.json");
const { DefinePlugin } = require('webpack');

module.exports = () =>
	/** @type WebpackConfig */({
	target: 'node',
	entry: './src/index.ts',
	output: {
		path: path.resolve('./dist'),
		filename: 'index.js',
		libraryTarget: 'commonjs2',
		devtoolModuleFilenameTemplate: '../[resource-path]',
	},
	devtool: 'source-map',
	externals: {
		vscode: 'commonjs vscode',
		"crypto": true,
		"fs": true,
		"path-is-absolute": true
	},
	resolve: {
		extensions: ['.ts', 'js', 'json']
	},
	plugins: [
		new DefinePlugin({ EXTENSION_NAME: JSON.stringify(packageName) }),
		new BundleDeclarationsWebpackPlugin({ entry: "./src/index.ts" })
	],
	module: {
		rules: [
			{
				test: /(?<!\.test)\.ts$/i,
				exclude: /node_modules/i,
				use: [
					{
						loader: 'ts-loader',
						options: {
							onlyCompileBundledFiles: true,
							compilerOptions: {
								module: 'es2020'
							},
						},
					},
				],
			}
		],
	},
});

"use strict";

let webpack = require("webpack");
let path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");

baseWpConfig.entry.app.unshift("webpack-hot-middleware/client");
baseWpConfig.entry.frontend.unshift("webpack-hot-middleware/client");

module.exports = merge(baseWpConfig, {
	devtool: "#inline-source-map"

	, module: {
		rules: [
			{
				test: /\.scss$/
				, loaders: [
					"style-loader"
					, "css-loader"
					, "postcss-loader"
					, {
						loader: "sass-loader"
						, options: {
							includePaths: [
								path.resolve(__dirname, "..", "client", "scss")
								, path.resolve(__dirname, "..", "node_modules")
							]
						}
					}
				]
			}
			, {
				test: /\.vue$/
				, loader: "vue-loader"
			}
			, {
				test: /\.pug$/
				, loader: "pug-plain-loader"
			}
		]
	}

	, performance: {
		hints: false
	}

	, plugins: [
		new VueLoaderPlugin()
		, new webpack.HotModuleReplacementPlugin()
		, new webpack.NoEmitOnErrorsPlugin()
	]
});

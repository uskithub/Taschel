"use strict";

let webpack = require("webpack");
let path = require("path");

let merge = require("webpack-merge");
let baseWpConfig = require("./webpack.base.config");
let ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = merge(baseWpConfig, {
	module: {
		rules: [
			{
				test: /\.scss$/
				, loader: ExtractTextPlugin.extract({
					fallback: "style-loader"
					, use: [{
						loader: "css-loader"/*,
						options: {
							modules: true
						}*/
					}, {
						loader: "postcss-loader"
					}, {
						loader: "sass-loader"
					}]
				})
			}
			, {
				test: /\.vue$/
				, loader: "vue-loader"
				, options: {
					loaders: {
						sass: ExtractTextPlugin.extract({
							fallback: "vue-style-loader"
							, use: [
								{
									loader: "css-loader"/*,
									options: {
										modules: true
									}*/
								}
								, {
									loader: "postcss-loader"
								} 
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
						})
					}
				}
			}
			, {
				test: /\.pug$/
				, loader: "pug-plain-loader"
			}
		]
	}
	, plugins: [
		new VueLoaderPlugin()
		, new webpack.DefinePlugin({
			"process.env": {
				"NODE_ENV": JSON.stringify("production")
			}
		})
		, new webpack.optimize.CommonsChunkPlugin({
			name: "vendor"
		})		
		, new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
		, new webpack.LoaderOptionsPlugin({
			minimize: true
		})

		, new ExtractTextPlugin("styles/[name].css")
	]
});

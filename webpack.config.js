const path = require("path");

module.exports = [
	{
		entry: {
			"image-rotate": "./src/ImageRotate.js"
		},
		output: {
			filename: "[name].min.js",
			path: path.resolve(__dirname, "dist"),
			libraryTarget: "umd",
			publicPath: "/dist/"
		},
		devServer: {
			contentBase: "./src"
		},
		externals: {
			quill: "Quill"
		},
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ["style-loader", "css-loader"]
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: "babel-loader",
					options: {
						presets: ["@babel/preset-env"]
					}
				},
				{
					test: /\.svg$/,
					use: [
						{
							loader: "raw-loader"
						}
					]
				}
			]
		}
	}
];

var path = require("path");

module.exports = {
	entry: "./src/ImageRotate.js",
	output: {
		path: __dirname,
		library: "ImageRotate",
		libraryTarget: "umd",
		filename: "image-rotate.min.js"
	},
	devtool: 'eval-source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				include: path.join(__dirname, "src"),
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [["es2015", { modules: false }]],
							plugins: ["babel-plugin-transform-class-properties"]
						}
					}
				]
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
};

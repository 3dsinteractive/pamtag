const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const getPackageJson = require("./scripts/getPackageJson");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const { version, name, license, repository, author } = getPackageJson(
  "version",
  "name",
  "license",
  "repository",
  "author"
);

function now() {
  let currentDate = new Date();
  let options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };
  let dateTimeString = currentDate.toLocaleString(undefined, options);
  return dateTimeString;
}

const banner = `
  ${name} v${version}
  Copyright (c) ${author.replace(/ *<[^)]*> */g, " ")} and project contributors.
  build date: ${now()}
  This source code is licensed under the ${license} license found in the
  LICENSE file in the root directory of this source tree.
`;

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./src/lib/index.ts",
  output: {
    filename: "pamtracker.js",
    path: path.resolve(__dirname, "build"),
    library: "PamTracker",
    libraryTarget: "umd",
    clean: true,
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({ extractComments: false }),
      //new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "raw-loader",
      },
      {
        test: /\.(m|j|t)s$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          //MiniCssExtractPlugin.loader,
          // { loader: "css-loader", options: { sourceMap: true } },
        ],
      },
    ],
  },
  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: "css/index.css",
    // }),
    new webpack.BannerPlugin(banner),
  ],
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
};

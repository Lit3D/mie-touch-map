import { resolve } from "path"

import {
  Configuration,
  DefinePlugin,
  HotModuleReplacementPlugin,
  LoaderOptionsPlugin,
  ProgressPlugin,
  SourceMapDevToolPlugin,
  WebpackPluginInstance,
} from "webpack"

const isProduction = process.env.NODE_ENV === "production"

import HtmlWebpackPlugin from "html-webpack-plugin"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import ScriptExtHtmlWebpackPlugin from "script-ext-html-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"

const PATH = (...p: Array<string>) => resolve(__dirname, ...p)
const PKG = require("./package.json")

const postCSSPlugins = [
  require("postcss-import")(),
].concat(isProduction ? [
  require("cssnano")({ preset: "default" }),
] : [])

export default {
  name: PKG.name,

  mode: isProduction ? "production" : "development",
  target: "web",

  context: PATH("./src"),

  entry: {
    app: PATH("./src/main.ts"),
    styles: PATH("./src/styles/index.css"),
  },

  resolve: {
    extensions: [".ts", ".mjs", ".js", ".json"],
    mainFields: [ "es2015", "browser", "module", "main"],
    symlinks: true,
  },

  output: {
    path: PATH("./artifacts"),
    filename: `js/[name].js`,
    crossOriginLoading: false,
  },

  experiments: {
    asset: true
  },

  module: {
    rules: [{
      // === HTML ===
      test: /\.html$/i,
      type: "asset/source",
      exclude: [
        PATH("./src/index.html"),
      ],
    },{
      // === StylesS ===
      test: /\.css$/i,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      },{
        loader: "css-loader",
        options: {
          importLoaders: 1
        }
      },{
        loader: "postcss-loader",
        options: {
          ident: "main",
          plugins: postCSSPlugins
        }
      }]
    },{
      // === Typescript loader ===
      test: /\.tsx?$/,
      use: [{
        loader: "ts-loader",
      }]
    }],
  },

  plugins: [
    new ProgressPlugin({}),

    new LoaderOptionsPlugin({
      debug: !isProduction,
      sourceMap: !isProduction,
      minimize: isProduction,
    }),

    new DefinePlugin({
      DEFINE_APP_NAME: JSON.stringify(PKG.name.trim()),
      DEFINE_APP_VERSION: JSON.stringify(PKG.version.trim()),
      DEFINE_DEBUG: JSON.stringify(!isProduction),
    }),

    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      chunkFilename: "css/[name].css",
    }),

    new HtmlWebpackPlugin({
      template: PATH("./src/index.html"),
      inject: "head",
      chunksSortMode: "manual",
      chunks: ["runtime", "styles", "app"],
    }),

    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: "defer"
    }),
  ].concat(isProduction ? [] : [
    // === Development mode plugins ===
    new SourceMapDevToolPlugin({
      filename: "[file].map",
      include: [/js$/, /css$/],
    }),

    new HotModuleReplacementPlugin(),
  ]),

  optimization: {
    noEmitOnErrors: true,
    removeEmptyChunks: true,
    runtimeChunk: "single",
    splitChunks: { chunks: "all" },
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        sourceMap: !isProduction,
        terserOptions: {
          ecma: 2020,
          output: {
            ascii_only: true,
            comments: false,
          },
          compress: {
            passes: 3,
          },
        }
      }) as WebpackPluginInstance,
    ]
  },

  performance: {
    hints: false,
  },

  node: false,
  profile: false,
  devtool: isProduction ? false : "eval-cheap-source-map",

  stats: "errors-warnings",

  watch: true,
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: ["node_modules/**"]
  }

} as Configuration
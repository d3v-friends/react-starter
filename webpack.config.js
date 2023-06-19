"use strict";

// import library
const webpack = require("webpack");
const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const terserPlugin = require("terser-webpack-plugin");

process.env.TZ = "ETC/UTC";
const mode = process.env.NODE_ENV || "development";
const template = path.resolve(__dirname, "template", "index.html");
const entry = path.resolve(__dirname, "react", "index.tsx");
const staticPath = path.resolve(__dirname, "template");
const devtool = mode === "development" ? "inline-source-map" : false;
const port = Number(process.env.PORT) || 3100;
const outPath = path.resolve(__dirname, "public");
const minimize = mode === "product";
const minimizer = minimize
    ? [
          new terserPlugin({
              parallel: true,
          }),
      ]
    : [];

const fnNewJsNm = () => {
    const now = new Date();
    return `${now.getFullYear()}_${
        now.getMonth() + 1
    }_${now.getDay()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}.js`;
};

module.exports = {
    mode,
    entry,
    devtool,
    devServer: {
        port,
        static: staticPath,
        liveReload: true,
        historyApiFallback: {
            index: "/index.html",
        },
    },
    watchOptions: {
        aggregateTimeout: 200,
        poll: 500,
    },
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "images/[name].[ext]",
                        },
                    },
                ],
            },
            {
                test: /\.(oft)$/i,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "fonts/[name].[ext]",
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"],
        alias: {
            // tsconfig 에서 paths 로 지정한 alias 여기에도 같이 선언해주어야 한다.
            // "src": path.resolve(__dirname, "src", "",)
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            React: "react",
        }),
        new htmlWebpackPlugin({
            template,
            filename: "index.html",
            minify: {
                collapseWhitespace: minimize,
                removeComments: minimize,
            },
        }),
        (() => {
            const env = {};
            for (const key in process.env) {
                if (!key.startsWith("REACT_APP")) continue;
                env[key] = process.env[key];
                console.log(`${key}=${process.env[key]}`);
            }
            return new webpack.EnvironmentPlugin(env);
        })(),
    ],
    optimization: {
        minimize,
        minimizer,
    },
    output: {
        filename: fnNewJsNm(),
        path: outPath,
    },
};

//@ts-check

"use strict"

const EntryFile = "./src/main.ts"
const OutDirectory = "lib"
const JSOutFile = "package-switch.js"

const TsLoaderOptions = {
    transpileOnly: true, // transpileOnly to ignore typescript errors,
    compiler: "typescript" // set to ttypescript use transform-for-of. Default is "typescript"
}

/********************************************************************************/

const path = require("path")

/**@type {import('webpack').Configuration}*/
const config = {
    target: "node", // Atom packages run in a Node.js-context, https://webpack.js.org/configuration/node/

    entry: EntryFile, // the entry point of this package, https://webpack.js.org/configuration/entry-context/

    output: {
        // the bundle is stored in the 'lib' folder (check package.json), https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, OutDirectory),
        filename: JSOutFile,
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]"
    },
    devtool: "source-map",
    externals: {
        // https://webpack.js.org/configuration/externals/
        atom: "atom",
        electron: "electron"
    },
    resolve: {
        extensions: [".ts", ".js", ".less", ".coffee"]
    },
    module: {
        rules: [
            {
                // all source files with a `.ts` extension will be handled by `ts-loader`
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    // ts
                    {
                        loader: "ts-loader",
                        options: TsLoaderOptions
                    }
                ]
            },
            // all source files with a `.less` extension will be handled by `less-loader`
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: 'less-loader', // compiles Less to CSS
            },
            // all source files with a `.coffee` extension will be handled by `coffee-loader`
            {
                test: /\.coffee$/,
                exclude: /node_modules/,
                loader: 'coffee-loader',
            },
        ]
    }
}
module.exports = config

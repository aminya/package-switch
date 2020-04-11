import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import coffeescript from "rollup-plugin-coffee-script"
import json from "@rollup/plugin-json"
import { terser } from "rollup-plugin-terser"
import pkg from "./package.json"

export default [
  {
    input: "src/main.ts",
    output: {
      dir: "lib",
      // file: pkg.main, // disabled due to dynamic import for season (set inlineDynamicImports: true) if wanted
      format: "cjs",
      sourcemap: true,
    },

    // loaded externally
    external: [
      "atom",
      "fs",
      "path",
      "atom-space-pen-views" // loaded because of errors
    ],
    plugins: [

      // so Rollup can find externals
      resolve(
        { extensions: [".js", ".coffee"], preferBuiltins: true }
        ),

      // so Rollup can convert externals to an ES module
      commonjs({
        // namedExports: { "space-pen": ["View"] } // not working
      }),

      // so Rollup can convert CoffeeScript to JavaScript
      coffeescript(),

      // so Rollup can convert TypeScript to JavaScript
      typescript(
        { noEmitOnError: false }
      ),

      // so Rollup can bundle JSON to JavaScript
      json(
        { compact: true }
      ),

      // minify
      terser(),
    ]
  }
]

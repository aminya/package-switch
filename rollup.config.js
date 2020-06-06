import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import coffeescript from 'rollup-plugin-coffee-script';
import typescript from "@rollup/plugin-typescript"
import json from "@rollup/plugin-json"
import {terser} from 'rollup-plugin-terser';

let plugins = [

  // so Rollup can find externals
  resolve({extensions: ['.js', '.coffee', 'ts'], preferBuiltins: true}),

  // so Rollup can convert externals to an ES module
  commonjs(),

  // so Rollup can convert TypeScript to JavaScript
  typescript(
    { noEmitOnError: false }
  ),

  // if any (in deps as well): Convert CoffeeScript to JavaScript
  coffeescript(),

  // so Rollup can bundle JSON to JavaScript
  json(
    { compact: true }
  ),
];

// minify only in production mode
if (process.env.NODE_ENV === 'production') {
  plugins.push(
    // minify
    terser({
      ecma: 2018,
      warnings: true,
      compress: {
        drop_console: false,
      },
    })
  );
}

export default [
  {
    input: 'src/main.ts',
    output: [
      {
        dir: "lib",
        format: 'cjs',
        sourcemap: true,
      },
    ],
    // loaded externally
    external: [
      "atom",
      // node stuff
      "path",
      "fs"
    ],
    plugins: plugins,
  },
];

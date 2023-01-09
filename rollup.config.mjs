import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json" assert { type: "json" };

const banner = [].join("\n");
const input = "src/index.ts";
const external = Object.keys(pkg.dependencies)
  .concat(["events"]);

// main
const main = {
  input,
  plugins: [
    typescript({
      module: "ES2015",
      removeComments: true,
    }),
  ],
  external,
  output: [
    {
      banner,
      file: pkg.main,
      format: "cjs",
    },
    {
      banner,
      file: pkg.module,
      format: "es",
    },
  ],
};

const browserExternals = {
  "@xmldom/xmldom": "self",
  "xpath": "self",
};

const browser = [
  {
    input,
    plugins: [
      resolve({
        mainFields: ["jsnext", "module", "main"],
        preferBuiltins: true,
      }),
      commonjs(),
      typescript({
        module: "ES2015",
        removeComments: true,
      }),
    ],
    external: Object.keys(browserExternals),
    output: [
      {
        file: pkg.unpkg,
        format: "es",
        globals: browserExternals,
      }
    ]
  },
  {
    input: pkg.unpkg,
    external: Object.keys(browserExternals),
    plugins: [
      babel({
        babelrc: false,
        runtimeHelpers: true,
        compact: false,
        comments: false,
        presets: [
          ["@babel/env", {
            targets: {
              ie: "11",
              chrome: "60",
            },
            useBuiltIns: "entry",
            corejs: 3,
          }],
        ],
        plugins: [
          ["@babel/plugin-proposal-class-properties"],
          ["@babel/proposal-object-rest-spread"],
        ]
      }),
    ],
    output: [
      {
        banner,
        file: pkg.unpkg,
        globals: browserExternals,
        format: "iife",
        name: "XmlDSigJs",
      },
      {
        banner,
        file: pkg.unpkgMin,
        globals: browserExternals,
        format: "iife",
        name: "XmlDSigJs",
        plugins: [
          terser(),
        ]
      },
    ],
  },
];

export default [
  main,
  ...browser,
];
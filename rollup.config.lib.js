import typescript from "rollup-plugin-typescript";

let pkg = require("./package.json");
let external = Object.keys(pkg.dependencies);
external.push("asn1js");

let sourceMap = process.argv.some(item => item.toLowerCase() === "--dev");

export default {
    input: "src/index.ts",
    plugins: [
        typescript({ typescript: require("typescript"), target: "es5" }),
    ],
    external: external,
    output: [
        {
            file: pkg.main,
            format: "cjs",
            sourceMap
        }
    ]
};
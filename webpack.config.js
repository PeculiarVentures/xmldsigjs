"use strict"

const path = require("path");

module.exports = {  
  entry: "./src/index.ts",
  output: {
    libraryTarget: "var",
    library: "xmldsig",
    filename: "dist/xmldsig.js"
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".js"]
  },
  module: {
    loaders: [
      { test: /\.ts$/, loader: "ts-loader", exclude:path.resolve(__dirname, "node_modules") }
    ]
  },
  node: {
      Buffer: false,
      crypto: false,
  }
}
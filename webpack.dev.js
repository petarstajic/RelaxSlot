const path = require("path");
const merge = require("webpack-merge");
const common = require("./webpack.common.js");
module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "none",
  devServer: {
    //source code directory.
    contentBase: path.resolve(__dirname, "src"),
    port: 8080,

    //if host set to 127.0.0.1, you cannot access the server on local network.
    host: "localhost",
    hot: true,

    open: true,

    watchOptions: {
      poll: true,
      ignored: "/node_modules/"
    }
  }
});

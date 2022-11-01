var path = require('path');

module.exports = {
  devtool: 'nosources-sourcemap',
  entry: [
    './src/main/index.js'
  ],
  output: {
    filename: 'index.js',
    library: 'CanvasJs',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist/')
  },
  externals: {
    mithril: 'mithril'
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, }
    ]
  }
};

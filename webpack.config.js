var webpack           = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {

  entry: './hawk/public/src/javascripts/hawk.js',

  output: {
    filename: './hawk/public/build/bundle.js',
    library: 'hawk'
  },

  module: {
    rules: [
      {
        test : /\.(png|jpg|svg)$/,
        use : "file-loader?name=[path][name].[ext]"
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              minimize: 1,
              importLoaders: 1
            }
          },
          'postcss-loader'
        ])
      }
    ]
  },
    plugins: [
        new ExtractTextPlugin("hawk/public/build/bundle.css")
    ],

    devtool: "source-map",

    watch: true,

    watchOptions: {
      aggragateTimeout: 50
    }

};
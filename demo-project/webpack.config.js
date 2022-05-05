/*
 * @Author: victorsun
 * @Date: 2022-05-04 20:13:37
 * @LastEditors: victorsun
 * @LastEditTime: 2022-05-04 21:41:02
 * @Descripttion: 
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  mode: 'development',
  devServer: {
    port: 4096,
    hot: true,
  },
  resolve: {},
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public', to: 'public' },
      ],
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      shared: path.resolve(__dirname, '../shared/src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  ...(isProduction ? {} : {
    devtool: 'eval-source-map',
    devServer: {
      port: 4200,
      host: 'localhost',
      historyApiFallback: true,
      client: {
        overlay: false,
      },
    },
  }),
};

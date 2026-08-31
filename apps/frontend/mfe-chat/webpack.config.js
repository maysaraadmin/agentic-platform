const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'auto',
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
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfeChat',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/Module.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
        axios: { singleton: true, requiredVersion: '^1.0.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
  ...(isProduction ? {} : {
    devtool: 'eval-source-map',
    devServer: {
      port: 3001,
      host: '0.0.0.0',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }),
};

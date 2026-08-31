const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const hostNodeModules = path.resolve(__dirname, '../host/node_modules');

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
      'ts-loader': path.resolve(hostNodeModules, 'ts-loader'),
      typescript: path.resolve(hostNodeModules, 'typescript'),
      webpack: path.resolve(hostNodeModules, 'webpack'),
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
    new ModuleFederationPlugin({
      name: 'mfeDashboard',
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
      port: 3002,
      host: '0.0.0.0',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }),
};

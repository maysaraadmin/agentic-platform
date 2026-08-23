const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const webpack = require('webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const mfeChatUrl = process.env.MFE_CHAT_URL || (isProduction ? '/mfe-chat/remoteEntry.js' : 'http://localhost:3001/remoteEntry.js');
const mfeDashboardUrl = process.env.MFE_DASHBOARD_URL || (isProduction ? '/mfe-dashboard/remoteEntry.js' : 'http://localhost:3002/remoteEntry.js');

module.exports = {
  mode: isProduction ? 'production' : 'development',
  target: 'web',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'host.js',
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
  optimization: {
    splitChunks: { chunks: 'all' },
  },
  externals: {
    'mfe-chat/Module': 'mfeChat',
    'mfe-dashboard/Module': 'mfeDashboard',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        mfeChat: `mfeChat@${mfeChatUrl}`,
        mfeDashboard: `mfeDashboard@${mfeDashboardUrl}`,
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: isProduction ? 'production' : 'development',
    }),
  ],
  ...(isProduction ? {} : {
    devtool: 'eval-source-map',
    devServer: {
      port: 4200,
      host: '0.0.0.0',
      historyApiFallback: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }),
};

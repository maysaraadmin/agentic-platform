const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const { DefinePlugin } = require('webpack');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const nxApiUrl = process.env.NX_API_URL || 'http://localhost:8000';
const mfeChatUrl = process.env.MFE_CHAT_URL || 'http://localhost:3001/remoteEntry.js';
const mfeDashboardUrl = process.env.MFE_DASHBOARD_URL || 'http://localhost:3002/remoteEntry.js';

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
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        'mfe-chat': `mfeChat@${mfeChatUrl}`,
        'mfe-dashboard': `mfeDashboard@${mfeDashboardUrl}`,
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        '@tanstack/react-query': { singleton: true, requiredVersion: '^5.0.0' },
      },
    }),
    new DefinePlugin({
      'process.env.NX_API_URL': JSON.stringify(nxApiUrl),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
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

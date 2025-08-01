const path = require('path');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'calculator.bundle.js',
    charset: true
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/, 
        use: 'ts-loader',
        exclude: /node_modules/
      },
      { 
        test: /\.html$/, 
        use: 'html-loader' 
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
        "knockout-amd-helpers": path.join( __dirname, "js/knockout-amd-helpers.min.js" ),
        "knockout": path.join( __dirname, "js/knockout-min.js" ),
    }
  },
  optimization: {
	  minimize: true
  }
};
const fs = require('fs');
const path = require('path');

const packageConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const externals = Object.keys(packageConfig.dependencies);
externals.push('commonjs');
externals.push('vscode');

module.exports = {
  mode: 'production',
  entry: __dirname + '/src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'source-map',
  target: 'node',
  externals: externals,
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.js']
  },
  
};
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/
        ]
      }
    ]
  },
  target: 'node',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@household/moneywallet-importer': path.resolve('src'),
      '@household/shared': path.resolve('../../shared/src'),
    }
  },
  node: {
    // Allow these globals.
    __filename: false,
    __dirname: false
  },
  optimization: {
    minimize: false,
    chunkIds: 'named',
  },
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  }
}

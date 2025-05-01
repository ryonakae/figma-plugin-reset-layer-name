/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('node:path')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = (env, argv) =>
  /** @type {import('webpack').Configuration} */
  ({
    mode: argv.mode === 'production' ? 'production' : 'development',
    devtool: argv.mode === 'production' ? false : 'inline-source-map',
    entry: {
      code: './src/code.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.ts'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            sourceMap: false,
            warnings: false,
            compress: {
              pure_funcs: ['console.log', 'console.error', 'console.warn'],
            },
            output: {
              comments: /@license/i,
            },
          },
        }),
      ],
    },
  })

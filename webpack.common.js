const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackBar = require('webpackbar');
const path = require('path');
const toml = require('toml');
const yaml = require('yamljs');
const json5 = require('json5');
const isProductionMode = process.env.NODE_ENV === "production";
 

module.exports = {
  entry: {
    app: './src/index.js',
  },
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'asstes/[hash][ext][query]',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // 排除 node_modules 與 bower_components 底下資料 (第二步)
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              ['module-resolver', {
                root: ['./src'],
                alias: {},
              }]
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          isProductionMode ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          isProductionMode ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            }
          } : 'style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          isProductionMode ? {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            }
          } : 'style-loader',// This plugin should be used only on production builds without style-loader in the loaders chain, especially if you want to have HMR in development.
          // Here is an example to have both HMR in development and your styles extracted in a file for production builds.
          'css-loader',
          'less-loader',
          'postcss-loader',
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: 'icons/[hash][ext]',
        },
        use: 'svgo-loader'
      },
      {
        test: /\.txt/,
        type: 'asset', // inline or resource
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb inline
          },
        },
        generator: { // resource
          filename: 'txt/[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: { // resource
          filename: 'fonts/[hash][ext]'
        }
      },
      {
        test: /\.toml$/i,
        type: 'json',
        parser: {
          parse: toml.parse,
        },
      },
      {
        test: /\.yaml$/i,
        type: 'json',
        parser: {
          parse: yaml.parse,
        },
      },
      {
        test: /\.json5$/i,
        type: 'json',
        parser: {
          parse: json5.parse,
        },
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isProductionMode ? '[name].[hash].css' : '[name].css',
      chunkFilename: isProductionMode ? '[id].[hash].css' : '[id].css',
    }),
    new HtmlWebpackPlugin({
      title: 'Caching',  
    }),
    new BundleAnalyzerPlugin(),
    new WebpackBar(),
  ],
  optimization: {
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      // use in big node_modules to caching file
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        styles: {
          test: /\.css$/,
          name: 'styles',
          chunks: 'all',
          enforce: true
        }
      },
    },
  },
};
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const webpack = require('webpack');
const path = require('path');
const SimpleProgressPlugin = require('webpack-simple-progress-plugin');
const postCSSImport = require('postcss-import');
const cssnext = require('postcss-cssnext');
const postcssReporter = require('postcss-reporter');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// Relative path of CSS assets.
const CSS_ASSETS_BASE = (isProd) ? '/assets/' : '';

// Options for CSS loader.  Transforms CSS classes/ids into localized hashes
// (e.g. 'foo' -> '._t0gZ1') to avoid CSS name collisions.
const cssLoaderOptions = {
  loader: 'css-loader',
  options: {
    sourceMap: true,
    modules: true,
    importLoaders: 1
  }
};

module.exports = {
  // Starts executing with this input.
  entry: path.join(__dirname, 'src/js/client.js'),

  // Controls how results are emitted.
  output: {
    path: path.join(__dirname, 'dist/public'),
    filename: 'js/client.min.js',
    publicPath: (isProd) ? '' : '/'
  },

  // Home directory for Webpack.
  context: path.join(__dirname, 'src'),

  // Provides debugging info for browser devtools.
  devtool: 'source-map',

  // Performance warnings.
  performance: isProd ? {hints: 'warning'} : false,

  // Webpack Dev Server options.
  devServer: {
    quiet: false,
    noInfo: false,
    historyApiFallback: true,
    stats: 'minimal',
    contentBase: path.join(__dirname, 'dist/public')
  },

  // Target environment for bundles; controls chunk loading behavior.
  target: 'web',

  // For resolving module requests (unrelated to loaders).
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src/js')
    ],
    // Allows leaving off the extension when JS importing.
    extensions: ['.js', '.json', '.css'],
  },

  // Don't bundle these, as they're brought in through CDN <script> tags.
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },

  // Filetype-specific handling.
  module: {
    noParse: /react\.js|react-dom/g,
    rules: [
      // JSX
      {
        test: /\.txt$/,
        use: 'text-loader'
      },

      // JSX
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'src'),
        exclude: /react|react-dom|node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: true /* load options from .babelrc */
            }
          }
        ]
      },

      // CSS
      {
        test: /\.css$/,
        use: (isProd) ? ExtractTextPlugin.extract({
          // PROD
          fallback: 'style-loader',
          use: [
            cssLoaderOptions,
            'postcss-loader'
          ]
        }) : [
          // DEV.
          // Note: don't run ExtractTextPlugin here, which isn't compatible with hot updates.
          'style-loader',
          cssLoaderOptions,
          'postcss-loader'
        ]
      },

      // IMAGES
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          // Generic file handling.
          {
            loader: 'file-loader',
            options: {
              hash: 'sha512',
              digest: 'hex',
              // Append file hash to filename for cache invalidation.
              name: `${CSS_ASSETS_BASE}[name]-[sha512:hash:base64:7].[ext]`
            }
          },
          // Compress images.
          {
            loader: 'image-webpack-loader',
            options: {
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 7
              },
              progressive: true,
              bypassOnDebug: true,
              pngquant: {
                quality: '65-90',
                speed: 4
              }
            }
          }
        ]
      },

      // HTML
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  },
  plugins: isProd ? [
    // PROD plugins

    // Sets NODE_ENV to prod.  Removes a lot of debugging code in React.
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

    // Displays Webpack progress bar on command line.
    new SimpleProgressPlugin(),

    // Extracts CSS from JS and outputs to app.css
    new ExtractTextPlugin({
      filename: 'styles/app.css',
      disable: false,
      allChunks: true
    }),

    // Merges chunks more aggresively.
    // https://webpack.github.io/docs/list-of-plugins.html#aggressivemergingplugin
    new webpack.optimize.AggressiveMergingPlugin(),

    // Minifies JavaScript.
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      sourceMap: true,
      compress: {
        warnings: true
      },
      output: {
        comments: false
      },
      beautify: false,
      preserveComments: false
    })
  ] : [
    // DEV plugins

    // Displays Webpack progress bar on command line.
    new SimpleProgressPlugin()
  ]
};

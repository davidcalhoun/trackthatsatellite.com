const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const package = require("./package.json");
const postcssCustomMedia = require("postcss-custom-media");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const reactRegexp = /[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/;
const satelliteRegexp = /[\\/]node_modules[\\/](satellite.js)[\\/]/;
const mapboxRegexp = /[\\/]node_modules[\\/](mapbox-gl)[\\/]/;
const materialRegexp = /[\\/]node_modules[\\/](@material-ui)[\\/]/;

const config = {
  entry: ["./src/index.js"],
  output: {
    path: path.resolve(__dirname, "docs"),
    filename: "[name].[contenthash].js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        use: "file-loader"
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "url-loader",
            options: {
              mimetype: "image/png"
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [
                require("postcss-global-import"),
                postcssCustomMedia({
                  importFrom: path.resolve(__dirname, "src/shared.css")
                }),
                require("autoprefixer")
              ]
            }
          }
        ]
      },
      {
        test: /\.(txt)$/i,
        use: [
          {
            loader: "file-loader"
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"],
    alias: {}
  },
  devServer: {
    contentBase: "./docs",
    open: true,
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "index.html", // output
      inject: true,
      appMountId: "app",
      templateParameters: {
        title: "Track That Satellite"
      },
      minify: false,
      chunks: [
        "satellite",
        "react",
        "mapbox",
        "material",
        "vendor",
        "runtime",
        "main"
      ],
      chunksSortMode: "manual" // manual: sort in the order of the chunks array
    })
  ],
  optimization: {
    runtimeChunk: "single",
    moduleIds: "hashed", // makes sure hashes don't change unexpectedly
    splitChunks: {
      cacheGroups: {
        react: {
          test: reactRegexp,
          name: "react",
          chunks: "all",
          enforce: true
        },
        satellite: {
          test: satelliteRegexp,
          name: "satellite",
          chunks: "all",
          enforce: true
        },
        mapbox: {
          test: mapboxRegexp,
          name: "mapbox",
          chunks: "all",
          enforce: true
        },
        material: {
          test: materialRegexp,
          name: "material",
          chunks: "all",
          enforce: true
        },
        vendor: {
          test(mod) {
            // exclude anything outside node modules
            if (!mod.context.includes("node_modules")) {
              return false;
            }

            // exclude other explicit chunk deps
            if (
              reactRegexp.test(mod.context) ||
              satelliteRegexp.test(mod.context) ||
              mapboxRegexp.test(mod.context) ||
              materialRegexp.test(mod.context)
            ) {
              return false;
            }

            // return all other node modules
            return true;
          },
          name: "vendor",
          chunks: "all"
        }
      }
    }
  }
};

module.exports = (env, argv) => {
  if (argv.hot) {
    // Hack: cannot use 'contenthash' when hot reloading is enabled.
    config.output.filename = "[name].[hash].js";
  }

  if (argv.mode === 'production') {
    config.plugins.push(new BundleAnalyzerPlugin());
  }

  return config;
};

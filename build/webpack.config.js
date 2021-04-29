const path = require('path');
const Webpack = require('webpack');
const HappyPack = require('happypack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const happyThreadPool = HappyPack.ThreadPool({ size: 5 });
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const devMode = process.argv.indexOf('--mode=production') === -1;

module.exports = {
    // 优化1 合理配置mode参数
    // development(开发模式) mode不设置默认为production(生产模式)去除无用代码
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, '../src/main.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[hash:8].js'
    },
    devServer: {
        port: 3000,
        hot: true,
        contentBase: '../dist'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: {
                            preserveWhitespace: false
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                use: [{
                    loader: 'happypack/loader?id=happyBabel'
                }],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'cache-loader',
                    {
                        loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../dist/css/',
                            hmr: devMode
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: ['cache-loader', 'vue-style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.scss$/,
                use: [
                    'cache-loader',
                    {
                        loader: devMode ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../dist/css/',
                            hmr: devMode
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(jep?g|png|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10240,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: 'img/[name].[hash:8].[ext]'
                            }
                        }
                    }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10240,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: 'media/[name].[hash:8].[ext]'
                            }
                        }
                    }
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 10240,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: 'media/[name].[hash:8].[ext]'
                            }
                        }
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            filename: 'index.html'
        }),
        new HappyPack({
            id: 'happyBabel',
            loaders: [
                'cache-loader',
                {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    "modules": false
                                }
                            ]
                        ]
                    }
                }
            ],
            threadPool: happyThreadPool
        }),
        new vueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        }),
        new Webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./vendor-manifest.json')
        }),
        new CopyWebpackPlugin([ // 拷贝生成的文件 这样每次不必手动去cv
            {
                from: 'static',
                to: 'static',
            }
        ]),
        new BundleAnalyzerPlugin({
            analyzerHost: '127.0.0.1',
            analyzerPort: 9001
        }),
        new Webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
        alias: {
            // 优化2 缩小文件的搜索范围
            // 当我们代码中出现 import 'vue'时， webpack会采用向上递归搜索的方式去依赖目录找，为了减少搜索范围，我们可以直接告诉它去哪找
            'vue$': 'vue/dist/vue.runtime.esm.js',
            ' @': path.resolve(__dirname, '../src')
        },
        extensions: ['*', '.js', '.json', '.vue']
    },
    externals: {
        'vue': 'Vue',
    }
}

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import TerserPlugin from 'terser-webpack-plugin';

export default {
    experiments: {
        outputModule: true,
    },
    optimization: {
        minimize: true,
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: {
        main: './src/entry.js',
    },
    output: {
        filename: '[name].js',
        library: {
            type: 'module'
        }
    },
    module: {
        rules: [
            {
                test: /\.(sass|scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: false,
                            modules: false,
                        },
                    },
                    'sass-loader',
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.css'
        })
    ],
    optimization: {
        minimizer: [
            new TerserPlugin()
        ]
    }
};
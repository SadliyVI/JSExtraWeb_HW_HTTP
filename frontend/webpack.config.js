import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

export default (env, argv) => {
    const isProd = argv.mode === 'production';
    const API_URL = env?.API_URL || 'http://localhost:7070';

    return {
        entry: './src/index.js',
        output: {
            path: path.resolve('dist'),
            filename: 'bundle.[contenthash].js',
            clean: true,
            publicPath: '',
        },
        devtool: isProd ? false : 'source-map',
        devServer: { port: 8080, open: true },
        module: {
            rules: [
                { test: /\.css$/i, use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'] },
                { test: /\.(svg|png|jpg|jpeg|gif)$/i, type: 'asset/resource' },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({ template: './public/index.html' }),
            new webpack.DefinePlugin({
                __API_URL__: JSON.stringify(API_URL),
            }),
            ...(isProd ? [new MiniCssExtractPlugin()] : []),
        ],
    };
};
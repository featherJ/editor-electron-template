import path from 'path';
import { Configuration } from 'webpack';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import TerserPlugin from 'terser-webpack-plugin';

export const isDev = process.env.NODE_ENV === 'development';

/**
 * 创建一个基本的webpack配置
 * @param output 
 * @returns 
 */
export const createBaseConfig = (output: string) => {
    const config: Configuration = {
        mode: isDev ? "development" : "production",
        context: path.join(__dirname, '../src'),
        output: {
            filename: '[name]',
            path: path.join(__dirname, "../", output),
        },
        module: {
            rules: rules.concat(),
        },
        plugins: plugins.concat(),
        resolve: {
            extensions: ['.js', '.ts'],
            modules: [
                path.join(__dirname, '../src'),
                "node_modules"
            ],
        },
        optimization: isDev ? undefined : {
            usedExports: true,
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        compress: {
                            drop_console: true, // 去除 console.log
                            drop_debugger: true // 去除 debugger
                        }
                    }
                })
            ]
        }
    };
    return config;
}
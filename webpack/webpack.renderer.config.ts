
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { createBaseConfig, isDev } from './webpack.base.config';
import nodeExternals from 'webpack-node-externals';

/**
 * 创建渲染进程webpack配置
 * @param output 
 * @returns 
 */
export const createRendererConfig = (output: string) => {
  const config = createBaseConfig(output);
  config.target = "electron-renderer";
  config.devtool = isDev ? "cheap-module-source-map" : false;
  config.entry = {
    "workbench.js": "code/electron-browser/workbench/workbench.ts",
    "preload.js": "code/electron-browser/workbench/preload.ts"
  };
  if(config.output){
    config.output.publicPath = "";
  }
  config.module?.rules?.push({
    test: /.css$/,
    use: ['style-loader', 'css-loader']
  });
  // config.externals = [nodeExternals()]
  config.plugins?.push(new HtmlWebpackPlugin({
    template: './code/electron-browser/workbench/workbench.html', // 你的 HTML 模板文件路径
    filename: 'workbench.html', // 输出文件名
    inject: 'body', // 脚本插入位置，默认 'body'
    chunks: ['workbench.js']
  }));
  return config;
}

import { createBaseConfig, isDev } from './webpack.base.config';

/**
 * 创建主进程webpack配置
 * @param output 
 * @returns 
 */
export const createMainConfig = (output: string) => {
  const config = createBaseConfig(output);
  config.target = "electron-main";
  config.devtool = isDev ? "source-map" : false;
  config.entry = { "main.js": "code/electron-main/main.ts" };
  return config;
}
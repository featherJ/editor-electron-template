import { glob } from 'glob';
import type { EntryObject } from 'webpack';
import { createBaseConfig, isDev } from './webpack.base.config';


/**
 * 创建es模块的webpack配置
 * @param output 
 * @returns 
 */
export const createEsmConfig = (output: string) => {
  const config = createBaseConfig(output);

  const emsFiles = glob.sync('src/**/*.esm.ts');
  const entry: EntryObject = {};
  for (let i = 0; i < emsFiles.length; i++) {
    let file = emsFiles[i];
    file = file.replace(/\\/g, "/");
    const index = file.indexOf("src/");
    file = file.slice(index + "src/".length);
    file = file.slice(0, file.length - 2)
    entry[file + "js"] = file + "ts";
  }
  config.target = "electron-renderer";
  config.devtool = isDev ? "cheap-module-source-map" : false;
  config.entry = entry;
  if (config.output) {
    config.output.publicPath = "";
    config.output.libraryTarget = "module";
    config.output.module = true;
    config.output.environment = {
      module: true,
      dynamicImport: true
  }
  }
  config.experiments = { outputModule: true };
  config.module?.rules?.push({
    test: /.css$/,
    use: ['style-loader', 'css-loader']
  });
  return config;
}
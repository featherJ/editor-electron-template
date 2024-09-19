import { glob } from 'glob';
import type { EntryObject } from 'webpack';
import { createBaseConfig, isDev } from './webpack.base.config';
import nodeExternals from 'webpack-node-externals';
import { builtinModules } from 'module';

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
    config.externals = [
      nodeExternals(), // 自动排除 node_modules
      Object.fromEntries(
        builtinModules.map((mod) => [mod, `commonjs ${mod}`])
      )
    ];
  if(config.output){
    // config.output.publicPath = "";
    // config.output.libraryTarget = "module";
    // config.output.publicPath = "";
    // config.output.globalObject='this'
    config.output.library = {type:"module"}
    config.output.environment = {nodePrefixForCoreModules:true}
  }
  config.resolve.mainFields = ["module","main"];
  // config.resolve.fallback = {
  //   "module": false,
  //   "fs": false, // 如果不需要 polyfill `fs`，设置为 false
  //     "path": false, // 如果不需要 polyfill `path`，设置为 false
  //     "crypto": false,}
  config.experiments = { outputModule: true, /*启用模块输出实验功能*/ };
  config.module?.rules?.push({
    test: /.css$/,
    use: ['style-loader', 'css-loader']
  });
  return config;
}
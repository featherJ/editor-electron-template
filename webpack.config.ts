import * as fs from "fs";
import * as path from "path";
import type { Configuration } from 'webpack';
import { createEsmConfig } from './webpack/webpack.esm.config';
import { createMainConfig } from './webpack/webpack.main.config';
import { createRendererConfig } from './webpack/webpack.renderer.config';

const output = "out";

const cleanDirectory = (directoryPath: string) => {
  if (fs.existsSync(directoryPath)) {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);
      if (entry.isDirectory()) {
        cleanDirectory(fullPath); // 递归删除子目录
        fs.rmdirSync(fullPath); // 删除空目录
      } else {
        fs.unlinkSync(fullPath); // 删除文件
      }
    }
  }
}
//先清理目标目录
cleanDirectory(path.join(__dirname, output));
const config: Configuration[] = [
  createMainConfig(output),
  createRendererConfig(output),
  createEsmConfig(output)
]
export default config;
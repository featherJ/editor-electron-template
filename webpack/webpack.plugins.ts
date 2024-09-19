import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as path from "path";
import { WebpackPluginInstance } from 'webpack';

export const plugins:WebpackPluginInstance[] = [
  new ForkTsCheckerWebpackPlugin({
    typescript: {
      configFile: path.resolve(__dirname, '../tsconfig.json'),
    },
    logger: 'webpack-infrastructure'
  })
];

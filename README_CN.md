# Editor Electron Template
中文文档 | [English](README.md)

这是一个 Electron 的模板项目，使用 [electron-easy-builder](https://github.com/featherJ/electron-easy-builder) 作为打包工具，使用 [electron-easy-updater](https://github.com/featherJ/electron-easy-updater) 作为更新器。


## 功能简介
* 支持 Windows 和 macOS 系统。
* macOS 上不强制要求更新包必须为已签名。
* 自动判断本次更新是全量更新，还是最小更新。
    * 全量更新是更新应用的全部内容。
    * 最小更新是只更新 `asar` 包，以及资源文件。而不会下载 `Electron` 和 `Node` 等运行环境。
* 简化的渲染进程以提高启动速度，然后动态加载真正的内容工作台。
* 完备的 `webpack` 配置。

## 如何使用

### 安装
先通过 `npm i` 安装所需的依赖。

### 自动更新
可以通过修改如下文件中 `url` 参数来测试自动更新流程。

文件 `src/code/electron-main/main.ts`:
```
const updater = new AppUpdater("https://xxx.xxx/xxx/app-update.json");
```
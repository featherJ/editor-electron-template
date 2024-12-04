# Electron Easy Updater
[中文文档](README_CN.md) | English

This is an Electron template project, using [electron-easy-builder](https://github.com/featherJ/electron-easy-builder) as the packaging tool and [electron-easy-updater](https://github.com/featherJ/electron-easy-updater) as the updater.

## Features Overview
* Supports Windows and macOS systems.
* Update packages on macOS do not require mandatory signing.
* Automatically determines whether the update is a full update or a minimal update.
  * A full update replaces the entire application.
  * A minimal update only updates the `asar` package and resource files, without downloading the `Electron` and `Node` runtime environments.
* Simplified renderer process to improve startup speed, followed by dynamic loading of the actual content workspace.
* Comprehensive `webpack` configuration.

## How to Use
### Installation
First, install the required dependencies using `npm i`.

### Auto Update
You can test the auto-update process by modifying the `url` parameter in the following file.

File `src/code/electron-main/main.ts`:
```
const updater = new AppUpdater("https://xxx.xxx/xxx/app-update.json");
```
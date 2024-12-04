import { enable, initialize } from '@electron/remote/main';
import { app, BrowserWindow, dialog } from 'electron';
import { AppUpdater } from "electron-easy-upd8r";
import logger from 'electron-log';
import * as path from 'path';

initialize();

const createWindow = () => {
  console.log('App is ready');
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '/preload.js')  
    },
  });
  enable(mainWindow.webContents);
  // Enable SharedArrayBuffer
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    details.responseHeaders['Cross-Origin-Opener-Policy'] = ['same-origin'];
    details.responseHeaders['Cross-Origin-Embedder-Policy'] = ['require-corp'];
    callback({ responseHeaders: details.responseHeaders });
  });
  mainWindow.loadFile(path.join(__dirname, "/workbench.html"));
  return mainWindow;
};

app.on('ready', () => {
  console.log(`Electron version: ${process.versions.electron}`);
  createWindow();
  setTimeout(() => { checkUpdate() }, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


// TODO 将如下 configUrl 替换为您已配置好的地址
// TODO Replace the following configUrl with your configured address.

/* 在开发过程中，支持本地路径的测试如：/Users/xxx/app-update.json 或 D:\xxx\app-update.json 
（无论是开发环境还是发型环境请确保更新包文件与app-update.json处于同一目录下） */

/* During development, support testing with local paths, e.g., /Users/xxx/app-update.json or D:\xxx\app-update.json.
(Ensure that the update package files are in the same directory as app-update.json in both development and production environments.) */

const updater = new AppUpdater("https://xxx.xxx/xxx/app-update.json");

const checkUpdate = async () => {
  // 打印日志到本地
  // Print logs locally
  console.log("userData: ", app.getPath('userData'));

  logger.transports.file.maxSize = 1002430 // 10M
  logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
  logger.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log')

  updater.logger = logger;
  // 添加更新监听
  // Add updater listener
  updater.on("checking-for-update", () => {
    console.log("checking-for-update");
  });
  updater.on("update-available", info => {
    console.log("update-available", info);
  });
  updater.on("update-not-available", info => {
    console.log("update-not-available", info);
  });
  updater.on("download-progress", (loaded, total) => {
    console.log(`download-progress loaded:${loaded} total:${total}`);
  });
  updater.on("update-downloaded", file => {
    console.log("update-downloaded", file);
  });
  updater.on("error", (error, message) => {
    console.log(`error:${error} message:${message}`);
  });

  // 检查更新
  // Check for updates
  const updateInfo = await updater.checkForUpdates();

  if (updateInfo) {
    let downloaded: string = null;
    try {
      downloaded = await updater.downloadUpdate((loaded, total) => {
        // 可以更新界面显示下载进度
        // Display download progress
      });
    } catch (error) {
      // 下载失败
      // Download failed
    }
    if (downloaded) {
      dialog.showMessageBox({
        title: `New Version Available`,
        message: `The latest version v${updateInfo.remoteVersion} has been downloaded for you.`,
        buttons: ['Install Now', 'Cancel'],
        defaultId: 0,
      }).then(async result => {
        if (result.response === 0) {
          try {
            await updater.quitAndInstall();
          } catch (error) {
            // 安装失败
            // Installation failed
          }
        }
      });
    }
  }
}
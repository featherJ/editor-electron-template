import { app, BrowserWindow } from 'electron';
import { enable } from '@electron/remote/main';
import * as path from 'path';
import { AppUpdater } from './updater';
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@electron/remote/main').initialize()

//测试使用
// Object.defineProperty(app, 'isPackaged', {
//   get() {
//     return true;
//   }
// });

const updater = new AppUpdater("C:\\Users\\Agua.L\\Documents\\project\\editor-electron-template\\dist\\app-update.json");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  console.log('App is ready');
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
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

};
// app.disableHardwareAcceleration();
app.on('ready', ()=>{
  console.log(`Electron version: ${process.versions.electron}`);
  createWindow();
  // 减产版本更新

  //todo 完善自动更新的弹窗示例
  setTimeout(async () => {
    const updateInfo =await updater.checkForUpdates();
    if(updateInfo){
      const downloaded = await updater.downloadUpdate((loaded,total)=>{
        console.log(loaded,total);
      });
      if(downloaded){
        await updater.quitAndInstall();
      }
    }
  }, 1000);
 
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
import { app } from 'electron';
import * as fs from "fs";
import * as path from "path";
import * as os from 'os';
import { exec } from 'child_process';

interface AppBuildConfig {
    electron: string;
    build: string;
    arch: "x64" | "arm64" | "x86";
}

interface BaseBuildConfig {
    electron: string,
    build: string,
}

interface ArchUpdate {
    download: {
        filename: string;
        size: number;
    };
    minimal: {
        filename: string;
        size: number;
    },
    full: {
        filename: string;
        size: number;
    }
}

const log = (text:string)=>{
    let exist = "";
    try {
        exist = fs.readFileSync("/Users/apple/Documents/FacnyGit/editor-electron-template/dist/log.txt",{encoding:"utf8"});
    } catch (error) {
        //
    }
    exist += text;
    exist += "\n";
    fs.writeFileSync("/Users/apple/Documents/FacnyGit/editor-electron-template/dist/log.txt",exist);
}


/**
 * 更新配置文件
 */
interface UpdateConfig extends BaseBuildConfig {
    date: string;
    version: string;
    "x64": ArchUpdate;
    "arm64": ArchUpdate;
    "x86": ArchUpdate;
    releaseNotes: string[];
}
/**
 * 远程打包配置文件格式
 */
interface RemoteConfig {
    "mac"?: UpdateConfig;
    "win"?: UpdateConfig;
}


export interface UpdateInfo {
    readonly currentVersion: string;
    readonly remoteVersion: string;
    readonly filename: string;
    readonly url: string;
    readonly size: number;
    readonly fullUpdate: boolean;
    readonly releaseNotes?: string[];
    readonly releaseDate: Date;
    readonly system: "mac" | "win";
    // todo 加入最低系统需求 minimumSystemVersion 的支持
}

const compareVersion = (version1: string, version2: string) => {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    const length = Math.max(v1Parts.length, v2Parts.length);
    for (let i = 0; i < length; i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;
        if (v1Part < v2Part) {
            return -1;  // version1 < version2
        }
        if (v1Part > v2Part) {
            return 1;  // version1 > version2
        }
    }
    return 0;  // version1 == version2
}

//todo 还是得加上事件，可以用于ga统计等
//todo log日志的功能

export class AppUpdater {
    private configUrl: string;
    /**
     * @param url 更新配置文件的url
     */
    public constructor(configUrl: string) {
        this.configUrl = configUrl
    }

    private currentUpdateConfig: UpdateInfo;

    /**
     * 检查指定的配置url是否存在可用更新
     * 
     * Check if there is an available update at the specified configuration URL
     */
    public async checkForUpdates(): Promise<UpdateInfo | null> {
        log("开始检查更新")
        const currentAppVersion = app.getVersion();
        const currentAppConfig = this.getAppBuildConfig();
        const remoteAppConfig = await this.getRemoteConfig();
        if (!remoteAppConfig || !currentAppConfig) {
            return null;
        }
        let system: "mac" | "win";
        if (os.platform() == "darwin") {
            system = "mac";
        } else if (os.platform() == "win32") {
            system = "win";
        }
        const updateConfig = remoteAppConfig[system];
        if (!updateConfig) {
            return null;
        }
        const remoteAppVersion = updateConfig.version;
        if (compareVersion(currentAppVersion, remoteAppVersion) != -1) {
            //当前版本很新，不需要更新
            return null;
        }
        const arch = currentAppConfig.arch;
        const archUpdate = updateConfig[arch];
        let shouldFullUpdate = false;
        if (currentAppConfig.build != updateConfig.build || currentAppConfig.electron != updateConfig.electron) {
            shouldFullUpdate = true;
        }
        let filename: string;
        let size: number;
        if (shouldFullUpdate) {
            filename = archUpdate.full.filename;
            size = archUpdate.full.size;
        } else {
            filename = archUpdate.minimal.filename;
            size = archUpdate.minimal.size;
        }
        const directory = this.configUrl.substring(0, this.configUrl.lastIndexOf('/') + 1);
        const url = directory + filename;
        this.currentUpdateConfig = {
            currentVersion: currentAppVersion,
            remoteVersion: remoteAppVersion,
            filename, url, size,
            fullUpdate: shouldFullUpdate,
            releaseNotes: updateConfig.releaseNotes,
            releaseDate: new Date(updateConfig.date),
            system
        }
        return Promise.resolve(this.currentUpdateConfig);
    }


    private async getRemoteConfig(): Promise<RemoteConfig> {
        //检查本地
        try {
            if (fs.existsSync(this.configUrl)) {
                const configContent = fs.readFileSync(this.configUrl, { encoding: "utf-8" });
                return JSON.parse(configContent);
            }
        } catch (error) {
            //do nothing
        }
        //检查远程
        try {
            const response = await fetch(this.configUrl);
            const remoteConfig = await response.json();
            return remoteConfig;
        } catch (error) {
            //do nothing
        }
        return null;
    }

    private getAppBuildConfig(): AppBuildConfig {
        const configPath = this.getAppBuildPath();
        if (configPath) {
            try {
                const configContent = fs.readFileSync(configPath, { encoding: "utf8" });
                return JSON.parse(configContent) as AppBuildConfig;
            } catch (error) {
                //do nothing
            }
        }
        return null;
    }

    private getAppBuildPath(): string {
        let appPath = app.getAppPath();
        const appPathStat = fs.statSync(appPath);
        const configFilename = "app-build.json";
        let configPath = "";
        if (appPathStat.isDirectory()) {
            configPath = path.join(appPath, configFilename);
            if (fs.existsSync(configPath)) {
                //开发环境下的配置路径
                return configPath;
            } else {
                //打包后，没有将代码都打包成asar情况下的配置路径
                configPath = path.join(appPath, "../", configFilename);
                if (fs.existsSync(configPath)) {
                    return configPath;
                }
            }
        } else {
            appPath = path.dirname(appPath);
            configPath = path.join(appPath, configFilename);
            if (fs.existsSync(configPath)) {
                //打包后，将代码都打包成了asar情况下的配置路径
                return configPath;
            }
        }
        return null;
    }

    private getAppMacContentPath(): string {
        const appPath = app.getAppPath();
        const contentsPath = path.join(appPath, "../../");
        return contentsPath;
    }

    private checkAccess(path: string): boolean {
        try {
            fs.accessSync(path, fs.constants.W_OK);
            return true;
        } catch (error) {
            return false;
        }
    }


    /**
     * 下载更新包
     * 
     * Download the update package.
     * 
     * @param onProgress 
     * @returns 
     */
    public async downloadUpdate(onProgress?: (loaded: number, total: number) => void): Promise<string | null> {
        log("开始下载更新")
        if (!this.currentUpdateConfig) {
            return null;
        }
        if (onProgress) {
            onProgress(0, this.currentUpdateConfig.size);
        }
        //本地测试
        if (fs.existsSync(this.currentUpdateConfig.url)) {
            const localPath = path.join(os.tmpdir(), this.currentUpdateConfig.filename);
            fs.copyFileSync(this.currentUpdateConfig.url, localPath);
            onProgress(this.currentUpdateConfig.size, this.currentUpdateConfig.size);
            this.localUpdatePath = localPath;
            return localPath;
        }
         //远程下载
        const localPath = await this.download(this.currentUpdateConfig.filename, this.currentUpdateConfig.url, this.currentUpdateConfig.size, onProgress);
        this.localUpdatePath = localPath;
        return localPath;
    }

    private localUpdatePath: string;
    public async download(filename: string, url: string, total: number, onProgress: (loaded: number, total: number) => void): Promise<string | null> {
        const response = await fetch(url);
        if (!response.body) {
            throw new Error(`The remote update file ${filename} does not exist.`);
        }

        const localPath = path.join(os.tmpdir(), filename);
        const fileStream = fs.createWriteStream(localPath);
        const reader = response.body.getReader();

        let loaded = 0;
        // 处理流的内容
        async function read() {
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            loaded += value.length;
            fileStream.write(value);
            if (onProgress) {
                onProgress(loaded, total);
            }
            await read(); // 递归读取剩余数据
        }
        await read();
        fileStream.end();
        return localPath;
    }



    /**
     * 退出并安装更新，安装完成后会自动重启app。
     * 
     * Exit and install the update. The app will automatically restart after installation.
     */
    public quitAndInstall(): Promise<void> {
        //TODO 本地测试会引发无限循环，看如何解决
        log("开始安装更新")
        if (!this.localUpdatePath) {
            return Promise.reject(new Error("The update package needs to be downloaded first."));
        }
        if (this.currentUpdateConfig.system == "mac") {
            //TODO 测试
            return new Promise<void>((resolve, reject) => {

                const targetPath = this.getAppMacContentPath();
                log("目标目录: "+targetPath)
                log("检查目录是否可写")
                const writeable = this.checkAccess(targetPath);
                log("目录可写情况: "+writeable);
                let cmd = `unzip -o "${this.localUpdatePath}" -d "${this.getAppMacContentPath()}"`;
                if (!writeable) {
                    cmd = "sudu " + cmd;
                }
                log("解压源: "+this.localUpdatePath)
                log("解压目标: "+targetPath)
                exec(cmd, (error, stdout, stderr) => {
                    log("解压日志: "+stdout)
                    if (error) {
                        log("解压错误: "+error)
                        reject(error);
                        return;
                    }
                    if (stderr) {
                        log("解压错误: "+stderr)
                        reject(new Error(stderr));
                        return;
                    }
                    app.relaunch()
                    app.exit()
                    resolve();
                });
            });
        } else if (this.currentUpdateConfig.system == "win") {
            //TODO 测试以及看是否需要加入延时
            return new Promise<void>((resolve) => {
                const installArgs = ['/verysilent', '/update="true"'];
                exec(`"${this.localUpdatePath}" ${installArgs}`);
                app.exit()
                resolve();
            });
        }
        return Promise.resolve();
    }

}
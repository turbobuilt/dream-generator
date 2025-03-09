import { app, BrowserWindow, ipcMain } from "electron";
import path, { join } from "path";
import { dialog } from "electron";

import { exec, execSync } from "child_process";
import { autoUpdater } from "electron-updater"
import * as fs from "fs";
import { productName } from "../../package.json";

console.log("Version", process.version)
import "./llm/llama"

// 64 gb max
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=64000');


ipcMain.handle('checkForUpdates', async (event) => {
    // let yaml = '';
    // yaml += "provider: generic\n"
    // yaml += "url: your_site/update/windows_64\n"
    // yaml += "useMultipleRangeRequest: false\n"
    // yaml += "channel: latest\n"
    // yaml += "updaterCacheDirName: " + app.getName()
    let yaml = `provider: generic
url: https://updates.dreamgenerator.ai
useMultipleRangeRequest: false
channel: latest
updaterCacheDirName: ${app.getName()}`;
    let update_file = path.join(process.resourcesPath, 'app-update.yml');
    if(!fs.existsSync(update_file))
        fs.writeFileSync(update_file, yaml);
    autoUpdater.setFeedURL({
        provider: "generic",
        url: "https://updates.dreamgenerator.ai"
    })
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.on('checking-for-update', () => {
        event.sender.send('log', { message: "checking for updates" });
    });
    autoUpdater.on('update-available', () => {
        event.sender.send('log', { message: "update available" });
    });
    autoUpdater.on('update-not-available', () => {
        event.sender.send('log', { message: "update not available" });
    });
    autoUpdater.on('error', (error) => {
        event.sender.send('log', { message: "error doing update check", error });
    });
    autoUpdater.on('download-progress', (progress) => {
        event.sender.send("download-progress", progress)
        event.sender.send('log', { message: "download progress", progress });
    });
    event.sender.send('log', { message: "checking for updates" });
    let result = await autoUpdater.checkForUpdates();

    return JSON.stringify(result);
});

ipcMain.handle('getUserDataPath', () => {
    const appData = app.getPath('appData')
    app.setPath('userData', path.join(appData, productName))
    return app.getPath("userData")
});
ipcMain.handle('getCwd', () => join(__dirname, "../../"));
ipcMain.handle('getAppInfo', () => JSON.stringify(app));
ipcMain.handle('getTmpPath', () => app.getPath("temp"));
ipcMain.handle('isPackaged', () => app.isPackaged);
ipcMain.handle('getMediaPath', () => {
    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            // only allow audio or video files
            { name: 'Media', extensions: ['mp3', 'wav', 'mp4', 'webm', 'mov', 'm4a', 'ogg', 'aac'] }
        ]
    })
});
ipcMain.handle('getPlatformInfo', () => {
    return {
        platform: process.platform,
        arch: process.arch
    }
});
const createWindow = () => {
    // get screen size
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize
    const win = new BrowserWindow({
        width: width,
        height: height,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            sandbox: false,
            nodeIntegration: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            plugins: true
        },
    });

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, "../../vue/index.html"))
    } else {
        win.loadURL('http://localhost:5000');
    }
    // dev tools
    if (!app.isPackaged)
        win.webContents.openDevTools()
}
console.log("w");
app.whenReady().then(() => {
    createWindow()
});

app.on('window-all-closed', () => {
    app.quit()
});
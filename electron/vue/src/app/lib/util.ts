import { ipcRenderer } from "electron";
import { stat } from "fs/promises";
import { join } from "path";
import { app, BrowserWindow, ipcMain } from "electron";

export async function getFileSize(path) {
    try {
        let stats = await stat(path);
        return stats.size;
    } catch (err) {
        return 0;
    }
}

export async function fileExists(path) {
    return (await getFileSize(path)) > 0;
}

export async function isPackaged() {
    // console.log("is packaged", app.isPackaged);
    // return app.isPackaged;
    return await ipcRenderer.invoke('isPackaged');

}
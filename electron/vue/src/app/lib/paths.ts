import { app, ipcMain, ipcRenderer } from "electron";
import { mkdir } from "fs/promises";
import { join } from "path";
import { isPackaged } from "./util";

let loaded = false;
export async function getUserDataPath() {
    let userDatapath = await ipcRenderer.invoke('getUserDataPath');
    // userDatapath = join(userDatapath, 'dream_generator');
    if (!loaded) {
        loaded = true;
        await mkdir(userDatapath, { recursive: true });
    }
    return userDatapath;
}
export async function getModelsDir() {
    let appDir = await getUserDataPath();
    let dir =  join(appDir,'/downloaded_models');
    await mkdir(dir, { recursive: true } );
    return dir;
}
export async function getTmpPath() {
    return await ipcRenderer.invoke('getTmpPath');
}

export async function getCwd() {
    return await ipcRenderer.invoke('getCwd');
}
import { ipcMain, ipcRenderer } from "electron";

export async function getCwd() {
    return await ipcRenderer.invoke('getCwd');
}
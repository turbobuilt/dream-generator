import { exec, spawn } from "child_process";
import { models } from "./models/models";
import { Model } from "./models/Model";
import { Database } from "./lib/database";
import { ipcRenderer } from "electron";


const execPromise = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}

// export const preloadData = {
//     result: null as any,
//     error: null as any,
//     imageResult: null as any,
//     pipelineLoadingPercent: 0,
//     imageGenerationPercent: 0,
//     modelLoadingPercent: 0
// };
// (window as any).preloadData = preloadData;

ipcRenderer.on('log', (event, result) => {
    console.log("got data", result);
});


export async function checkForUpdate() {
    let result = await ipcRenderer.invoke('checkForUpdates');
    console.log("update result is", result);
    return result;
}
export async function getDatabase() {
    return Database;
}
export function downloadModel({ id, onProgress }) {
    return downloadModel({ id, onProgress });
}
export function pauseDownload(id) {
    if (models[id].dl) {
        models[id].paused = true;
        models[id].dl.pause();
    }
}
export function resumeDownload(id) {
    if (models[id].dl) {
        models[id].dl.resume();
        models[id].paused = false;
    }
}
// function pollData() {
//     return JSON.parse(JSON.stringify(preloadData));
// }
export async function getModels() {
    await Model.loadAll(Object.values(models));
    return models;
}
// function getResult() {
//     return preloadData.result;
// }
// function getError() {
//     return preloadData.error;
// }
checkForUpdate();
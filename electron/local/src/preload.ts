// import { exec, spawn } from "child_process";
// import { writeFile, readFile, unlink } from "fs/promises";
// import { join } from "path";
// import { llamaFunctions } from "./llm/llama";
// import { models } from "./models/models";
// import { Model } from "./models/Model";
// import { imageModelFunctions } from "./image/imageModelFunctions";
// import { Database } from "./lib/database";
// import { downloadModel } from "./models/downloadModel";
// import { audioMethods } from "./audio";
// import { ipcRenderer } from "electron";

import { imageFunctions } from "./image/imageFunctions";
import { submitPromptPreload } from "./llm/llama";



// const execPromise = (command) => {
//     return new Promise((resolve, reject) => {
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 reject(error);
//             }
//             resolve({ stdout, stderr });
//         });
//     });
// }

// export const preloadData = {
//     result: null as any,
//     error: null as any,
//     imageResult: null as any,
//     pipelineLoadingPercent: 0,
//     imageGenerationPercent: 0,
//     modelLoadingPercent: 0
// };
// (window as any).preloadData = preloadData;

// ipcRenderer.on('log', (event, result) => {
//     console.log("got data", result);
// });


export const nativeBridge = {
    imageFunctions,
    // submitPromptPreload
};
//     async checkForUpdate (){
//         let result =  await ipcRenderer.invoke('checkForUpdates');
//         console.log("update result is", result);
//         return result;
//     },
//     getDatabase: async function () {
//         return Database;
//     },
//     downloadModel({ id, onProgress }) {
//         return downloadModel({ id, onProgress });
//     },
//     pauseDownload(id) {
//         if (models[id].dl) {
//             models[id].paused = true;
//             models[id].dl.pause();
//         }
//     },
//     resumeDownload(id) {
//         if (models[id].dl) {
//             models[id].dl.resume();
//             models[id].paused = false;
//         }
//     },
//     pollData: function () {
//         return JSON.parse(JSON.stringify(preloadData));
//     },
//     async getModels() {
//         await Model.loadAll(Object.values(models));
//         return models;
//     },
//     getResult() {
//         return preloadData.result;
//     },
//     getError() {
//         return preloadData.error;
//     },
//     llamaFunctions,
//     imageModelFunctions,
//     ...audioMethods
// };
(window as any).nativeBridge = nativeBridge;

// nativeBridge.checkForUpdate();
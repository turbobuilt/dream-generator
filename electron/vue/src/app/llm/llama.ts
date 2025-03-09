import { llamacpp, streamText } from "modelfusion";
import { ipcRenderer } from "electron";
import { downloadLlamaCppOld, llamaCpp } from "./downloadLlamaCpp";
import { basename, dirname, join } from "path";
import { exec, spawn } from "child_process";
import { getCwd, getModelsDir } from "../lib/paths";
import { models } from "../models/models";
import { fileExists } from "../lib/util";
import { forceKill } from "../lib/killProcess";

let server: any;
export async function getLlamaCppPath() {
    let cwd = await getCwd();
    console.log(cwd)
    let platformInfo = await ipcRenderer.invoke('getPlatformInfo');
    let executable = join(cwd, "llamacpp", `${platformInfo.platform}_${platformInfo.arch}`);
    if (platformInfo.platform == "win32") {
        executable = join(executable, "avx2");
    }
    executable = join(executable, platformInfo.platform == 'win32' ? "server.exe" : "server");
    return executable;
}


export function getModels() {
    return models;
}

export async function loadModel(id) {
    if (server) {
        forceKill(server.pid).catch(err => console.error("caught error killing server", err));
    }
    await llamaCpp.loadStatus();
    if (!llamaCpp.extracted) {
        console.log("Extracted not present");
        throw { lamacpp_not_present: true }
    }
    console.log("Starting server")
    let serverLocation = await getLlamaCppPath();
    serverLocation = serverLocation.replace(/\\/g, "/")
    let model = models[id];
    let modelPath = await model.getModelPath();


    console.log("Model path", modelPath);
    // make sure it exists
    if (!await fileExists(modelPath)) {
        console.log("error file does not exist")
        model.extracted = false;
        throw { error: "Model not found downloaded", model_not_found: true }
        return;
    }
    console.log("start command", serverLocation, "-m", modelPath)
    server = spawn(`"${basename(serverLocation)}"`, ["-m", `"${modelPath}"`], {
        // stdio: "inherit",
        shell: true,
        cwd: dirname(serverLocation)
    });

    server.stdout.on('data', (data) => {
        console.log("stdout ", data.toString());
    });
    server.stderr.on('data', (data) => {
        console.error("stderr error", data.toString());
    });
    server.on("close", (data) => {
        console.log("closed...", data)
    })
    server.on("exit", (data) => {
        console.log("exit...", data)
    })
    server.on("error", (data) => {
        console.error("error...", data)
    })
}

export function unloadModel(modelId) {
    if (server) {
        forceKill(server.pid).catch(err => console.error("caught error killing server", err));
        server = null;
    }
}

export async function submitPrompt(data) {
    let { messages, modelId } = data;
    if (server == null) {
        await loadModel(modelId);
    }
    try {
        console.log("submitting prompt")
        // let result = await (window as any).nativeBridge.submitPromptPreload(data);
        // console.log("Result is", result);
        let result = await streamText({
            model: llamacpp.CompletionTextGenerator({
                promptTemplate: llamacpp.prompt.Llama2, // Choose the prompt template from the model card
                maxGenerationTokens: 8192,
                temperature: 0.7,
            }).withChatPrompt(),
            prompt: {
                system: "",
                messages
            }
        });
        // console.log("got result", result)
        return result;
    } catch (err) {
        console.error(err);
    }
}

// import { llamacpp, streamText } from "modelfusion";
// import { ipcRenderer } from "electron";
// import { downloadLlamaCppOld, llamaCpp } from "./downloadLlamaCpp";
// import { basename, dirname, join } from "path";
// import { exec, spawn } from "child_process";
// import { getModelsDir } from "../lib/paths";
// import { models } from "../models/models";
// import { fileExists, getCwd } from "../lib/util";
// import { forceKill } from "../lib/killProcess";

// let server: any;
// export async function getLlamaCppPath() {
//     let cwd = await getCwd();
//     console.log(cwd)
//     let platformInfo = await ipcRenderer.invoke('getPlatformInfo');
//     let executable = join(cwd, "llamacpp", `${platformInfo.platform}_${platformInfo.arch}`);
//     if (platformInfo.platform == "win32") {
//         executable = join(executable, "avx2");
//     }
//     executable = join(executable, platformInfo.platform == 'win32' ? "server.exe" : "server");
//     return executable;
// }

// async function loadModel(id) {
//     if (server) {
//         forceKill(server.pid).catch(err => console.error("caught error killing server", err));
//     }
//     await llamaCpp.loadStatus();
//     if (!llamaCpp.extracted) {
//         console.log("Extracted not present");
//         throw { lamacpp_not_present: true }
//     }
//     console.log("Starting server")
//     let serverLocation = await getLlamaCppPath();
//     serverLocation = serverLocation.replace(/\\/g, "/")
//     let model = models[id];
//     let modelPath = await model.getModelPath();


//     console.log("Model path", modelPath);
//     // make sure it exists
//     if (!await fileExists(modelPath)) {
//         console.log("error file does not exist")
//         model.extracted = false;
//         throw { error: "Model not found downloaded", model_not_found: true }
//         return;
//     }
//     console.log("start command", serverLocation, "-m", modelPath)
//     server = spawn(`"${basename(serverLocation)}"`, ["-m", `"${modelPath}"`], {
//         // stdio: "inherit",
//         shell: true,
//         cwd: dirname(serverLocation)
//     });

//     server.stdout.on('data', (data) => {
//         console.log("stdout ", data.toString());
//     });
//     server.stderr.on('data', (data) => {
//         console.error("stderr error", data.toString());
//     });
//     server.on("close", (data) => {
//         console.log("closed...", data)
//     })
//     server.on("exit", (data) => {
//         console.log("exit...", data)
//     })
//     server.on("error", (data) => {
//         console.error("error...", data)
//     })
// }
// export const llamaFunctions = {
//     getModels() {
//         return models;
//     },
//     loadModel,
//     unloadModel(modelId) {
//         if (server) {
//             forceKill(server.pid).catch(err => console.error("caught error killing server", err));
//             server = null;
//         }
//     },
//     async prompt(data) {
//         let { messages, modelId } = data;
//         if (server == null) {
//             await loadModel(modelId);
//         }
//         try {
//             let result = await streamText({
//                 model: llamacpp.CompletionTextGenerator({
//                     promptTemplate: llamacpp.prompt.Llama2, // Choose the prompt template from the model card
//                     maxGenerationTokens: 8192,
//                     temperature: 0.7,
//                 }).withChatPrompt(),
//                 prompt: {
//                     system: "",
//                     messages
//                 }
//             });
//             console.log("got result")
//             return result;
//         } catch (err) {
//             console.error(err);
//         }
//     }
// }
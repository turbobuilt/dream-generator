import { ipcRenderer } from "electron";
import { Model } from "../models/Model";
import { models } from "../models/models";
import { getPlatformInfo } from "../llm/downloadLlamaCpp";
import { spawn } from "child_process";
import { readFile, readdir, rename, rm, unlink, writeFile } from "fs/promises";
import { fileExists } from "../lib/util";
import net from "net";
import path, { join } from "path";
import { getCwd, getUserDataPath } from "../lib/paths";


export async function removeNoiseJs({ buffer, outputWavPath, outputToFile, onProgress, device = 'CPU' }) {
    let fileSize = buffer.length;
    let modelInfo = models["noise-suppression-poconetlike-0001"];
    let modelPath = await modelInfo.getModelPath();
    modelPath = path.join(modelPath, "noise-suppression-poconetlike-0001.xml");
    let platformInfo = await getPlatformInfo();
    if (platformInfo.platform === "win32") {
        // let stringified = removeNoiseJsInternal.toString();
        buffer = Buffer.from(buffer).toString('base64');
        if(outputToFile) {
            let documentsDir = await getUserDataPath();
            outputWavPath = path.join(documentsDir, "noise_suppression.wav");
        }
        // remove output path if exists
        if (await fileExists(outputWavPath)) {
            unlink(outputWavPath).catch(console.error);
        }
        let args = JSON.stringify({
            buffer,
            outputWavPath: outputWavPath,
            onProgress: null, 
            modelPath: modelPath,
            device: device
        });
        let cmd = 
`${removeNoiseJsInternalString};

let fs = require('fs/promises');
async function main() {
    //lets read from stdin
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        data += chunk;
    });
    process.stdin.on('end', function() {
        removeNoiseJsInternal(JSON.parse(data)).then((result) => {
            process.stdout.write(result);
            process.exit(0);
        });
    });
}
main();
`;
        return new Promise(async (resolve, reject) => {  
            console.log("spawning", cmd.slice(0,100))
            let nodePath = join(await getCwd(), "node", "node");
            let platformInfo = await getPlatformInfo();
            if (platformInfo.platform === "win32") {
                nodePath += ".exe";
            }
            let cwd = await getCwd();
            let child = spawn(nodePath, ["-e", cmd], { stdio: 'pipe', cwd: cwd });
            for (var i = 0; i < args.length; i += 1024) {
                child.stdin.write(args.slice(i, i + 1024));
            }
            // child.stdin.write(args);
            child.stdin.end();
            child.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
                if (data.indexOf('_SERVER_PORT:') === 0) {
                    let port = parseInt(data.toString().split(':')[1]);
                    let client = new net.Socket();
                    client.connect(port, '127.0.0.1', () => {
                        client.write(args);
                    });
                    client.on('data', (data) => {
                        console.log(`Received: ${data}`);
                        resolve(data);
                    });
                } else if (data.indexOf('progress:') === 0) {
                    let [_, progress] = data.toString().split(':');
                    onProgress({ current: parseInt(progress), total: fileSize });
                }
            });
            child.stderr.on('data', (data) => {
                console.log(`stderr: ${data}`);
            });
            child.on("close", async (code) => {
                // check if output file exists
                if (await fileExists(outputWavPath)) {
                    let buffer = await readFile(outputWavPath);
                    // remove it
                    unlink(outputWavPath).catch(console.error);
                    resolve(buffer);
                } else {
                    reject("Error processing audio");
                }
            });
        });
    } else {
        let removeNoiseJsInternal = new Function(removeNoiseJsInternalString);
        return await removeNoiseJsInternal({ buffer, outputWavPath, onProgress, device, modelPath });
    }
}

let removeNoiseJsInternalString = `
async function removeNoiseJsInternal({ buffer, outputWavPath, onProgress, device = 'CPU', modelPath }) {
    console.log("the cwd is", process.cwd())
    const fs = require('fs');
    const { writeFile } = fs.promises;
    const wav = require('node-wav');
    const path = require('path');
    const log = console;
    let { addon } = require('openvino-node');
    const ov = addon;
    console.log("removeNoiseJsInternal", buffer.length, "outputWavPath", outputWavPath, "device", device, "modelPath", modelPath);
    const core = new ov.Core();
    const model = await core.readModel(modelPath);
    const stateInpNames = model.inputs.map(item => item.anyName).filter(name => name.includes("state"));
    const inpShapes = Object.fromEntries(model.inputs.map(item => [item.anyName, item.shape]));


    log.info('Loading the model to', device);
    const compiledModel = await core.compileModel(model, device);
    let useBase64 = false;
    if (typeof buffer === 'string') {
        buffer = Buffer.from(buffer, 'base64');
        useBase64 = true;
    }
    const result = wav.decode(buffer);
    if (result.sampleRate !== 16000) {
        throw new Error("Sample rate of " + result.sampleRate + " Hz not supported. Expected 16000 Hz.");
    }

    const inferRequest = compiledModel.createInferRequest();
    inferRequest.infer();
    const inputSize = model.inputs[0].shape[1]; // Example to get input size, adjust as necessary
    let samplesOut = [];
    let state = null; // Placeholder for model state if applicable

    let lastNotice = Date.now();
    for (let i = 0; i < result.channelData[0].length; i += inputSize) {
        let inputSlice = result.channelData[0].slice(i, i + inputSize);
        if (inputSlice.length < inputSize) {
            // Padding if the last slice is smaller than expected input size
            inputSlice = new Float32Array([...inputSlice, ...new Array(inputSize - inputSlice.length).fill(0)]);
        }
        const inputTensor = new ov.Tensor(ov.element.f32, [1, inputSize], inputSlice);

        var inputs = { "input": inputTensor };
        for (let name of stateInpNames) {
            if (state) {
                inputs[name] = inferRequest.getTensor(name.replace('inp', 'out')).data;
            } else {
                inputs[name] = new Float32Array(inpShapes[name].reduce((a, b) => a * b, 1));
                inputs[name] = new ov.Tensor(ov.element.f32, inpShapes[name], inputs[name]);
            }
        }
        state = inferRequest.infer(inputs);
        samplesOut.push(inferRequest.getTensor("output").data);
        if (Date.now() - lastNotice > 1000) {
            log.info("progress: " + i + ":" + result.channelData[0].length);
            lastNotice = Date.now();
            if (onProgress)
                onProgress({ current: i, total: result.channelData[0].length })
        }
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Concatenate output samples
    const outputSamples = new Float32Array(samplesOut.length * inputSize);
    for (let i = 0; i < samplesOut.length; i++) {
        outputSamples.set(samplesOut[i], i * inputSize);
    }

    // Write the output WAV file
    const outputWavData = wav.encode([outputSamples], { sampleRate: 16000, float: true, bitDepth: 32 });
    if (outputWavPath) {
        await writeFile(outputWavPath, Buffer.from(outputWavData));
        return;
        // return "out_file: " + Buffer.from(outputWavData).toString('base64');
    }
    return outputWavData;
}
`;
var AdmZip = require("adm-zip");

export async function extractPoconet(model: Model, onProgress) {
    try {
        let downloadPatb = await model.getDownloadLocalPath();
        let modelPath = await model.getModelPath();
        var zip = new AdmZip(downloadPatb);
        zip.extractAllTo(modelPath, true);
        let dir = join(modelPath, "noise-suppression-poconetlike-0001-FP32");
        let files = await readdir(dir);
        for (let file of files) {
            let src = join(dir, file);
            let dest = join(modelPath, file);
            await rename(src, dest);
        }
        await rm(dir, { recursive: true });
        model.extracted = true;  
    } catch (err) {
        model.error = "Error extracting " + err.message;
    } finally {
        model.extracting = false;
        model.save().catch(console.error);
        onProgress(model);
    }
}
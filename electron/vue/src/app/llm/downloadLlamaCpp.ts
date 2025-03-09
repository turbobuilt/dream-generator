import { ipcRenderer } from "electron";
import { getLlamaCppPath } from "./llama";
import { chmod, mkdir, rename, rm, stat } from "fs/promises";
import { basename, dirname } from "path";
import { getUserDataPath } from "../lib/paths";
const { DownloaderHelper } = require('node-downloader-helper');
var AdmZip = require("adm-zip");

export async function getPlatformInfo() {
    let platformInfo = await ipcRenderer.invoke('getPlatformInfo');
    return platformInfo;
}

class LlamaCpp {
    bytesDownloaded?: number = 0;
    downloadContentLength?: number = 0;
    downloaded?: boolean = false;
    downloadSpeed?: number = 0;
    downloading? = false;
    extracting? = false;
    extracted? = true;
    paused?: boolean = false;
    dl?: any;
    error?: string = "";

    async loadStatus() {
        if (!this.extracted) {
            try {
                let path = await getLlamaCppPath();
                let stats = await stat(path);
                console.log("path is", path, "stats is ", stats)
                this.extracted = true;
            } catch (err) {
                this.extracted = false;
            }
        }
    }
}
export const llamaCpp = new LlamaCpp();

export async function decompressLlamaCpp(outputPath, onProgress) {
    try {
        llamaCpp.downloading = false;
        llamaCpp.downloaded = true;
        llamaCpp.extracting = true;
        let llamaCppPath = await getLlamaCppPath();
        let platformInfo = await getPlatformInfo();
        var zip = new AdmZip(outputPath);
        var zipEntries = zip.getEntries();
        let fileName = `server${platformInfo.platform === 'win32' ? '.exe' : ''}`;
        var serverFile = zipEntries.find(entry => entry.entryName === fileName);
        if (!serverFile) {
            throw new Error("Server file not found in zip");
        }
        let appDataPath = await getUserDataPath();
        zip.extractEntryTo(serverFile, appDataPath, false, true);
        await rename(`${appDataPath}/${fileName}`, llamaCppPath);
        // change permissions so it's executable
        await chmod(llamaCppPath, 0o755);
        llamaCpp.extracted = true;
        
        await rm(outputPath);
    } catch (err) {
        console.error(err);
        llamaCpp.error = "Error extracting " +  err.message;
        onProgress(llamaCpp);
    } finally {
        llamaCpp.extracting = false;
        onProgress(llamaCpp);
    }

}

export async function downloadLlamaCppOld(onProgress) {
    console.log("trying to downlaod llama cpp");
    let llamaCppPath = await getLlamaCppPath();
    let platformInfo = await getPlatformInfo();
    console.log("llamacpppath", llamaCppPath)
    var url = ""
    // if windows x64
    if (platformInfo.platform === 'win32' && platformInfo.arch === 'x64') {
        url = 'https://github.com/ggerganov/llama.cpp/releases/download/b2699/llama-b2699-bin-win-sycl-x64.zip';
    } else {
        throw new Error("Platform not supported");
    }
    let outputPath = `${dirname(llamaCppPath)}/${basename(url)}`
    console.log("downloading to ", outputPath)

    await mkdir(dirname(llamaCppPath), { recursive: true });
    try {
        llamaCpp.downloading = true;
        onProgress(llamaCpp);
        const dl = new DownloaderHelper(url, dirname(llamaCppPath), {
            fileName: basename(url),
        });
        dl.on('end', async () => {
            llamaCpp.bytesDownloaded = llamaCpp.downloadContentLength;
            llamaCpp.downloaded = true;
            llamaCpp.downloading = false;
            try {
                await decompressLlamaCpp(outputPath, onProgress);
            } catch (err) {
                console.log(err);
                llamaCpp.error = "error extracting: " + err.message;
                llamaCpp.extracting = false;
                onProgress(llamaCpp);
            }
        });
        dl.on('error', async (err) => {
            console.log("errrod lwonding");
            try {
                console.log("Removing", outputPath);
                await rm(outputPath);
            } catch (err) {
                console.log(err);
            }
            console.log(err);
            llamaCpp.error = err.message;
            llamaCpp.downloading = false;
            onProgress(llamaCpp);
        })
        dl.on('progress.throttled', ({ name, total, downloaded, progress, speed }) => {
            console.log("progress", downloaded, total, speed);
            llamaCpp.bytesDownloaded = downloaded;
            llamaCpp.downloadContentLength = total;
            llamaCpp.downloadSpeed = speed;
            onProgress(llamaCpp);
        });
        var exists = false;
        try {
            // if file exists on disk
            let stats = await stat(outputPath);
            exists = true;
        } catch (err) { }
        if (exists) {
            await dl.resumeFromFile(outputPath)
        } else {
            await dl.start()
        }
    } catch (err) {
        try {
            await rm(outputPath);
        } catch (err) {
            console.log(err);
        }
        console.error(err);
        llamaCpp.error = err.message;
        llamaCpp.downloading = false;
        onProgress(llamaCpp);
    }
}
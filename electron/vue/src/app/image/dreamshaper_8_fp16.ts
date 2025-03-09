import { ipcRenderer } from "electron";
import { chmod, mkdir, rename, rm, stat } from "fs/promises";
import { basename, dirname } from "path";
const { DownloaderHelper } = require('node-downloader-helper');
var AdmZip = require("adm-zip");

export async function getDreamShaper8FP16Path() {
    let appDir = await ipcRenderer.invoke('getUserDataPath')
    return `${appDir}/local/dreamshaper_8_openvino_fp16`;
}



class DreamShaper {
    bytesDownloaded?: number = 0;
    downloadContentLength?: number = 0;
    downloaded?: boolean = false;
    downloadSpeed?: number = 0;
    downloading? = false;
    extracting? = false;
    extracted? = false;
    paused?: boolean = false;
    dl?: any;
    error?: string = "";

    async loadStatus() {
        if (!this.extracted) {
            try {
                let path = await getDreamShaper8FP16Path();
                let stats = await stat(path);
                this.extracted = true;
            } catch (err) {
                this.extracted = false;
            }
        }
    }
}
export const dreamshaper8FP16 = new DreamShaper();

export async function decompressDreamShaper(outputPath, onProgress) {
    try {
        dreamshaper8FP16.downloading = false;
        dreamshaper8FP16.downloaded = true;
        dreamshaper8FP16.extracting = true;
        let dreamShaperPath = await getDreamShaperPath();
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
        await rename(`${appDataPath}/${fileName}`, dreamShaperPath);
        // change permissions so it's executable
        await chmod(dreamShaperPath, 0o755);
        dreamshaper8FP16.extracted = true;
        await rm(outputPath);
    } catch (err) {
        console.error(err);
        dreamshaper8FP16.error = "Error extracting " +  err.message;
        onProgress(dreamshaper8FP16);
    } finally {
        dreamshaper8FP16.extracting = false;
        onProgress(dreamshaper8FP16);
    }

}

export async function downloadDreamShaper(onProgress) {
    console.log("trying to downlaod llama cpp");
    let dreamShaperPath = await getDreamShaperPath();
    let platformInfo = await getPlatformInfo();
    var url = ""
    // if windows x64
    if (platformInfo.platform === 'win32' && platformInfo.arch === 'x64') {
        url = 'https://github.com/ggerganov/llama.cpp/releases/download/b2699/llama-b2699-bin-win-sycl-x64.zip';
    } else {
        throw new Error("Platform not supported");
    }
    let outputPath = `${dirname(dreamShaperPath)}/${basename(url)}`

    await mkdir(dirname(dreamShaperPath), { recursive: true });
    try {
        dreamshaper8FP16.downloading = true;
        onProgress(dreamshaper8FP16);
        const dl = new DownloaderHelper(url, dirname(dreamShaperPath), {
            fileName: basename(url),
        });
        dl.on('end', async () => {
            dreamshaper8FP16.bytesDownloaded = dreamshaper8FP16.downloadContentLength;
            dreamshaper8FP16.downloaded = true;
            dreamshaper8FP16.downloading = false;
            try {
                await decompressDreamShaper(outputPath, onProgress);
            } catch (err) {
                console.log(err);
                dreamshaper8FP16.error = "error extracting: " + err.message;
                dreamshaper8FP16.extracting = false;
                onProgress(dreamshaper8FP16);
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
            dreamshaper8FP16.error = err.message;
            dreamshaper8FP16.downloading = false;
            onProgress(dreamshaper8FP16);
        })
        dl.on('progress.throttled', ({ name, total, downloaded, progress, speed }) => {
            console.log("progress", downloaded, total, speed);
            dreamshaper8FP16.bytesDownloaded = downloaded;
            dreamshaper8FP16.downloadContentLength = total;
            dreamshaper8FP16.downloadSpeed = speed;
            onProgress(dreamshaper8FP16);
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
        dreamshaper8FP16.error = err.message;
        dreamshaper8FP16.downloading = false;
        onProgress(dreamshaper8FP16);
    }
}
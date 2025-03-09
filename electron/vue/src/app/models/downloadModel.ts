import { mkdir, stat } from "fs/promises";
import { getModelsDir } from "../lib/paths";
import { models } from "../models/models";
import { basename, dirname } from "path";
const { DownloaderHelper } = require('node-downloader-helper');
import axios from "axios";
import { getFileSize } from "../lib/util";
import { extractModel } from "./extractModel";

export async function downloadModel({ id, onProgress }) {
    let modelsDir = await getModelsDir();
    
    let model = models[id];
    if (!model) {
        throw new Error("Model not found");
    }
    let downloadPath = await model.getDownloadLocalPath();
    await mkdir(dirname(downloadPath), { recursive: true });
    console.log("Downloading model", model.downloadUrl, downloadPath);
    
    try {
        // first check content length
        let response = await axios.head(model.downloadUrl);
        // compare to file on disk if exists
        let size = await getFileSize(downloadPath);
        if (size > 0 && size === response.headers['content-length']) {
            model.downloaded = true;
            await model.save!();
            console.log("Model already downloaded, extracting");
            await extractModel(model, onProgress);
            return;
        }

        model.downloading = true;
        await model.save!();
        const dl = new DownloaderHelper(model.downloadUrl, dirname(downloadPath), {
            fileName: basename(downloadPath),
        });
        dl.on('end', async () => {
            console.log("Downloaded model, extracting");
            models[id].bytesDownloaded = models[id].downloadContentLength;
            models[id].downloaded = true;
            models[id].downloading = false;
            models[id].extracting = true;
            onProgress(models[id]);
            await model.save();
            console.log("Downloaded model, extracting");
            await extractModel(model, onProgress);
        });
        dl.on('error', async (err) => {
            console.log(err);
            models[id].error = err.toString();
            models[id].downloading = false;
            models[id].downloaded = false;
            await model.save();
            console.error("Error downloading model", err);
            onProgress(models[id]);
        })
        dl.on('progress.throttled', ({ name, total, downloaded, progress, speed }) => {
            models[id].bytesDownloaded = downloaded;
            models[id].downloadContentLength = total;
            models[id].downloadSpeed = speed;
            console.log(`Downloading ${name} - ${progress}% (${downloaded}/${total}) at ${speed} bps`);
            onProgress(models[id]);
        });
        if (size > 0) {
            console.log("Resuming download");
            await dl.resumeFromFile(downloadPath)
        } else {
            console.log("Starting new download");
            await dl.start()
        }
        model.dl = dl;
        // dl.resume();
    } catch (err) {
        console.error(err.stack);
        model.error = err.message;
        model.downloading = false;
        model.save().catch(console.error);
        onProgress(models[id]);
    }
}

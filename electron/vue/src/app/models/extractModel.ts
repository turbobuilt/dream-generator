import { rename, rm } from "fs/promises";
import { Model } from "./Model";

export async function extractModel(model: Model, onProgress: any) {
    console.log("Extracting model", model.id);
    let downloadPath = await model.getDownloadLocalPath();
    let modelPath = await model.getModelPath();
    await rm(modelPath, { recursive: true, force: true });
    console.log("extracting to", modelPath);
    onProgress(model);

    if (!model.extract && !model.extractFunction) {
        await rename(downloadPath, modelPath);
        model.extracted = true;
        await model.save();
        console.log("model does not need extraction, moved");
        onProgress(model);
        return;
    }
    
    model.extracting = true;
    await model.save();
    onProgress(model);
    if (model.extractFunction) {
        await model.extractFunction(model, onProgress);
        model.extracted = true;
        model.extracting = false;
        await model.save();
        await rm(downloadPath);
        console.log("model extracted", model.id);
        onProgress(model);
    } else {
        throw new Error("Extract function not defined");
    }
}
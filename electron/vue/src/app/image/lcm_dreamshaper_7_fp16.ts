import { Model } from "../models/Model";

var AdmZip = require("adm-zip");

export async function extractLcmDreamShaper7FP16(model: Model, onProgress) {
    try {
        let downloadPatb = await model.getDownloadLocalPath();
        let modelPath = await model.getModelPath();
        var zip = new AdmZip(downloadPatb);
        zip.extractAllTo(modelPath, true);
        model.extracted = true;  
    } catch (err) {
        model.error = "Error extracting " + err.message;
    } finally {
        model.extracting = false;
        model.save().catch(console.error);
        onProgress(model);
    }
}
import { Model } from "../models/Model";
import { isProd } from "../models/models";
import { extractPoconet } from "./noiseSuppression";



export const audioModels = {
    "noise-suppression-poconetlike-0001": new Model({
        id: "noise-suppression-poconetlike-0001",
        type: "audio",
        prettyName: "Intel® Noise Removal",
        downloadUrl: "https://static.dreamgenerator.ai/models/noise-suppression-poconetlike-0001-FP32.zip",
        description: "Background Noise Removal",
        extractFunction: extractPoconet,
    }),
}
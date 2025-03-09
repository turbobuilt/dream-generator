import { app } from "electron";
import { Model } from "../models/Model";
import { extractLcmDreamShaper7FP16 } from "./lcm_dreamshaper_7_fp16";
import { isProd } from "../models/models";



export const imageModels = {
    // "dreamshaper_8_openvino_fp16": new Model({
    //     id: "dreamshaper_8_openvino_fp16",
    //     type: "image",
    //     prettyName: "DreamShaper 8",
    //     downloadUrl: "https://images.dreamgenerator.ai/fp16static.zip",
    //     estimatedSize: 4.27*1000*1000*1000,
    //     description: "High Quality Stable Diffusion",
    //     extract: true
    // }),
    "lcm_dreamshaper_7_fp16": new Model({
        id: "lcm_dreamshaper_7_fp16",
        type: "image",
        prettyName: "DreamShaper",
        downloadUrl: "https://static.dreamgenerator.ai/models/lcm_dreamshaper_7_fp16.zip/lcm_dreamshaper_7_fp16.zip",
        // estimatedSize: 4.27*1000*1000*1000,
        executablePath: "models/openvino-lcm/lcm_dreamshaper",
        description: "Stable Diffusion - DreamShaper",
        extractFunction: extractLcmDreamShaper7FP16,
        getCommandArgs: async function() {
            return ["-m", await this.getModelPath()];
        },
        // inferenceServer: new ImageModelServer(),
    }),
}
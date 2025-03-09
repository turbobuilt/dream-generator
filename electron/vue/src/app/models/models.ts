import { imageModels } from "../image/imageModels";
import { textModels } from "../llm/textModels";
import { audioModels } from "../audio/audioModels"
import { Model } from "./Model";

export const isProd = true;

export const models = {
    ...textModels,
    ...imageModels,
    ...audioModels,
} as { [key: string]: Model };

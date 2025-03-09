import { ipcRenderer } from "electron";
import { removeNoiseJs } from "./noiseSuppression";

export const audioMethods = {
    removeNoiseJs,
}
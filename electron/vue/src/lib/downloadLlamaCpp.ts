import { reactive } from "vue";
import { store } from "../store";
import { LlamaCpp } from "../pages/chat/models/LlamaCpp";


export async function downloadLlamaCpp() {
    try {
        await window.nativeBridge.llamaFunctions.downloadLlamaCpp((data: LlamaCpp) => {
            Object.assign(store.llamaCpp, data);
        });
    } catch (e) {
        d.error = e.message || "Error - try again later or contact support@dreamgenerator.ai";
    }
}
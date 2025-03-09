import { Model } from "../models/Model";
import { isProd } from "../models/models";

export const textModels = {
    // "phi-3-small-4k-q4-k-m": new Model({
    //     id: "phi-3-small-4k-q4-k-m",
    //     type: "text",
    //     prettyName: "Phi 3 Small 4K",
    //     downloadUrl: "https://huggingface.co/cstr/Phi-3-mini-4k-instruct-LLaMAfied-GGUF/resolve/main/Phi-3-mini-4k-instruct-LLaMAfied-q4-k-m.gguf?download=true",
    //     estimatedSize: 2.39e+9,
    //     description: "Phi 3 is a small, fast model suitable for most computers from Microsoft. It is free to use. This version supports up to 10-15 thousand characters per the conversation."
    // }),
    "mistral-7b": new Model({
        id: "mistral-7b",
        type: "text",
        prettyName: "Mistral",
        downloadUrl: "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf?download=true",
        estimatedSize: 4368439584,
        description: "Mistral is a larger, slower, but really intelligent model suitable for computers with 16 GB of RAM."
    })
}
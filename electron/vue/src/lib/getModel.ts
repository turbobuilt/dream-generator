import { store } from "../store";
import { getTable } from "./database";

export async function getModel(modelId: string) {
    let modelsTable = await getTable("Model");
    if (!modelsTable[modelId]) {
        modelsTable[modelId] = {}
    }
    Object.assign(store.models[modelId], modelsTable[modelId]);
    return store.models[modelId];
}
import { store } from "@/store";

export function clearSelectedImage(taskId) {
    if (store.currentImage?.taskId === taskId) {
        store.currentImage = null;
    }
    if (store.imageGenerationRequests) {
        for (let i = store.imageGenerationRequests.length - 1; i >= 0; i--) {
            for (let j = store.imageGenerationRequests[i].items.length - 1; j >= 0; j--) {
                if (store.imageGenerationRequests[i].items[j].taskId === taskId) {
                    store.imageGenerationRequests[i].items.splice(j, 1);
                }
            }
            if (store.imageGenerationRequests[i].items.length === 0) {
                store.imageGenerationRequests.splice(i, 1);
            }
        }
    }
}
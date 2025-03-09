import { store } from "@/store";

export class CreateImageRequestSettings {
    constructor() {
        // this.model = (store.imageGenerationModels?.length && store.imageGenerationModels.find(item => item.default)?.value) || "sdxl"
    }
    model?: string = "sdxl";
    prompt?: string;
    style?: string;
    quantity?: number = 1;
    isRemoveBackground?: boolean = false;
}

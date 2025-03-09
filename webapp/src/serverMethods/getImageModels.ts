import { callMethod } from "@/lib/callMethod";

export function getImageModels(data?: any): Promise<void> {
    return callMethod("getImageModels", arguments);
}

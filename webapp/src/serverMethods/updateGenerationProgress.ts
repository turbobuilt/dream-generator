import { callMethod } from "@/lib/callMethod";

export function updateGenerationProgress(data?: any): Promise<any> {
    return callMethod("updateGenerationProgress", arguments);
}

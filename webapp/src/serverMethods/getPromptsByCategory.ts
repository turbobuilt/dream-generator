import { callMethod } from "@/lib/callMethod";

export function getPromptsByCategory(data?: any): Promise<void> {
    return callMethod("getPromptsByCategory", arguments);
}

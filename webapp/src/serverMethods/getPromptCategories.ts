import { callMethod } from "@/lib/callMethod";

export function getPromptCategories(data?: any): Promise<void> {
    return callMethod("getPromptCategories", arguments);
}

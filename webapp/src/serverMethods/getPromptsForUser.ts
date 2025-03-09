import { callMethod } from "@/lib/callMethod";

export function getPromptsForUser(data?: any): Promise<void> {
    return callMethod("getPromptsForUser", arguments);
}

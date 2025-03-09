import { callMethod } from "@/lib/callMethod";

export function unlikePrompt(data?: any): Promise<void> {
    return callMethod("unlikePrompt", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function submitImageGenerateWithPrompt(data?: any): Promise<any> {
    return callMethod("submitImageGenerateWithPrompt", arguments);
}

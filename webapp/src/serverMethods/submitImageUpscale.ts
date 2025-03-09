import { callMethod } from "@/lib/callMethod";

export function submitImageUpscaleWithPrompt(data?: any): Promise<any> {
    return callMethod("submitImageUpscaleWithPrompt", arguments);
}

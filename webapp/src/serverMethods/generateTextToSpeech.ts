import { callMethod } from "@/lib/callMethod";

export function generateTextToSpeech(prompt: any, modelId: any) {
    return callMethod("generateTextToSpeech", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function getTextToSpeechModels(prompt: any, modelName: any): Promise<{ id: number; name: string; voice: string; provider: string; model: string; dollarsPerMinute: number; }[]> {
    return callMethod("getTextToSpeechModels", arguments);
}

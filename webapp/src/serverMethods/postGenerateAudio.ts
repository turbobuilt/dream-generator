import { callMethod } from "@/lib/callMethod";

export function postGenerateAudio(promptData: GenerateAudioRequest): Promise<any> {
    return callMethod("postGenerateAudio", arguments);
}

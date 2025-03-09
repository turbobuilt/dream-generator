import { callMethod } from "@/lib/callMethod";

export function createShare(data: { parent: number; text: string; nudity: boolean; }): Promise<any> {
    return callMethod("createShare", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function saveShareComment(data: { share: number; parent: number; body: string; }): Promise<any> {
    return callMethod("saveShareComment", arguments);
}

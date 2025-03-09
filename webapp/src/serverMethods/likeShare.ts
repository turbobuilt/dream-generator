import { callMethod } from "@/lib/callMethod";

export function likeShare(data: { share: number; }): Promise<any> {
    return callMethod("likeShare", arguments);
}

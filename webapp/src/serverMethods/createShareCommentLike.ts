import { callMethod } from "@/lib/callMethod";

export function createShareCommentLike(data?: any): Promise<void> {
    return callMethod("createShareCommentLike", arguments);
}

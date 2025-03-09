import { callMethod } from "@/lib/callMethod";

export function getShareChildren(data: { share: number; levels: number; loadImages: boolean; }): Promise<any> {
    return callMethod("getShareChildren", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function showShare(data?: any): Promise<any> {
    return callMethod("showShare", arguments);
}

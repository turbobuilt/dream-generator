import { callMethod } from "@/lib/callMethod";

export function getShareEmail(data?: any): Promise<any> {
    return callMethod("getShareEmail", arguments);
}

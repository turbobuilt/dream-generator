import { callMethod } from "@/lib/callMethod";

export function getMoreCredits(data?: any): Promise<any> {
    return callMethod("getMoreCredits", arguments);
}

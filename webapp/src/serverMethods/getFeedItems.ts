import { callMethod } from "@/lib/callMethod";

export function getFeedItems(data?: any): Promise<any> {
    return callMethod("getFeedItems", arguments);
}

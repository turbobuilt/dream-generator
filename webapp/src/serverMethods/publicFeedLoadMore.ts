import { callMethod } from "@/lib/callMethod";

export function publicFeedLoadMore(data?: any): Promise<any> {
    return callMethod("publicFeedLoadMore", arguments);
}

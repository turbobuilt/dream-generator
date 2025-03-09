import { callMethod } from "@/lib/callMethod";

export function publicFeedPage(data?: any): Promise<void> {
    return callMethod("publicFeedPage", arguments);
}

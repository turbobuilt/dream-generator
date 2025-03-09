import { callMethod } from "@/lib/callMethod";

export function publicFeed(data?: any): Promise<any> {
    return callMethod("publicFeed", arguments);
}

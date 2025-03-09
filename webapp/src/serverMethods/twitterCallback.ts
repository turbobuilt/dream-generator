import { callMethod } from "@/lib/callMethod";

export function twitterCallback(data?: any): Promise<any> {
    return callMethod("twitterCallback", arguments);
}

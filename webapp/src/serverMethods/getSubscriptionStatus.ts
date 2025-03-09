import { callMethod } from "@/lib/callMethod";

export function getSubscriptionStatus(data?: any) {
    return callMethod("getSubscriptionStatus", arguments);
}

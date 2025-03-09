import { callMethod } from "@/lib/callMethod";

export function getStripeStatus(data?: any) {
    return callMethod("getStripeStatus", arguments);
}

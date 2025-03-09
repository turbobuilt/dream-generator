import { callMethod } from "@/lib/callMethod";

export function stripeWebhook(data?: any) {
    return callMethod("stripeWebhook", arguments);
}

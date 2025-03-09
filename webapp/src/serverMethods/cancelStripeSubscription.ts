import { callMethod } from "@/lib/callMethod";

export function cancelStripeSubscription(data?: any): Promise<any> {
    return callMethod("cancelStripeSubscription", arguments);
}

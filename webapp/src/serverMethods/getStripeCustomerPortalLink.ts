import { callMethod } from "@/lib/callMethod";

export default function getStripeCustomerPortalLink(data?: any): Promise<void> {
    return callMethod("getStripeCustomerPortalLink", arguments);
}

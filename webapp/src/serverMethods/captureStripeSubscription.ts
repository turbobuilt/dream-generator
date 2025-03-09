import { callMethod } from "@/lib/callMethod";

export default function captureStripeSubscription(data?: any) {
    return callMethod("captureStripeSubscription", arguments);
}

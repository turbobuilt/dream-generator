import { callMethod } from "@/lib/callMethod";

export function verifyStripeCreditPackPayment(data?: any): Promise<void> {
    return callMethod("verifyStripeCreditPackPayment", arguments);
}

export function verifyStripePayment(data?: any): Promise<any> {
    return callMethod("verifyStripePayment", arguments);
}

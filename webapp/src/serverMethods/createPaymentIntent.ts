import { callMethod } from "@/lib/callMethod";

export function createPaymentIntent(data?: any): Promise<any> {
    return callMethod("createPaymentIntent", arguments);
}

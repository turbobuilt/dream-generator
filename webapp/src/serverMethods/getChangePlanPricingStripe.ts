import { callMethod } from "@/lib/callMethod";

export function getChangePlanPricingStripe(newPlanId: string): Promise<any> {
    return callMethod("getChangePlanPricingStripe", arguments);
}

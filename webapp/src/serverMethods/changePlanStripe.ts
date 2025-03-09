import { callMethod } from "@/lib/callMethod";

export function changePlanStripe(newPlanId: string): Promise<any> {
    return callMethod("changePlanStripe", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function cancelStripePlan(data?: any): Promise<any> {
    return callMethod("cancelStripePlan", arguments);
}

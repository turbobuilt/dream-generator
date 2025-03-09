import { callMethod } from "@/lib/callMethod";

export function getPlans(data?: any) {
    return callMethod("getPlans", arguments);
}

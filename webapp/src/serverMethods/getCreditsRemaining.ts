import { callMethod } from "@/lib/callMethod";

export function getCreditsRemaining(data?: any) {
    return callMethod("getCreditsRemaining", arguments);
}

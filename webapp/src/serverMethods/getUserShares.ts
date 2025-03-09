import { callMethod } from "@/lib/callMethod";

export function getUserShares(data?: any): Promise<void> {
    return callMethod("getUserShares", arguments);
}

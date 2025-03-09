import { callMethod } from "@/lib/callMethod";

export function updateOnlineStatus(data?: any): Promise<void> {
    return callMethod("updateOnlineStatus", arguments);
}

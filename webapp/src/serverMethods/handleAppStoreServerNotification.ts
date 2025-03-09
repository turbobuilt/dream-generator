import { callMethod } from "@/lib/callMethod";

export function handleAppStoreServerNotification(data?: any): Promise<void> {
    return callMethod("handleAppStoreServerNotification", arguments);
}

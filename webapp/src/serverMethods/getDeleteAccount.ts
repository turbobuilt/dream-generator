import { callMethod } from "@/lib/callMethod";

export function getDeleteAccount(data?: any): Promise<void> {
    return callMethod("getDeleteAccount", arguments);
}

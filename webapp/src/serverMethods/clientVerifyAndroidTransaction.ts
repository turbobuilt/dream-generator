import { callMethod } from "@/lib/callMethod";

export function clientVerifyAndroidTransaction(data?: any): Promise<void> {
    return callMethod("clientVerifyAndroidTransaction", arguments);
}

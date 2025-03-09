import { callMethod } from "@/lib/callMethod";

export function clientVerifyIosTransaction(data?: any): Promise<void> {
    return callMethod("clientVerifyIosTransaction", arguments);
}

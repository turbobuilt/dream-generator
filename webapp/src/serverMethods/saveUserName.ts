import { callMethod } from "@/lib/callMethod";

export function saveUserName(data?: any): Promise<void> {
    return callMethod("saveUserName", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function getMicrosoftUsers(data?: any): Promise<void> {
    return callMethod("getMicrosoftUsers", arguments);
}

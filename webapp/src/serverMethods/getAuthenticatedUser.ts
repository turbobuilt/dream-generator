import { callMethod } from "@/lib/callMethod";

export function getAuthenticatedUser(data?: any): Promise<void> {
    return callMethod("getAuthenticatedUser", arguments);
}

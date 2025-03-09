import { callMethod } from "@/lib/callMethod";

export function fetchAuthenticatedUser(data?: any): Promise<any> {
    return callMethod("fetchAuthenticatedUser", arguments);
}

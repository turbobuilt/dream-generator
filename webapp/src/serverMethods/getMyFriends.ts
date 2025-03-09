import { callMethod } from "@/lib/callMethod";

export function getMyFriends(data?: any): Promise<void> {
    return callMethod("getMyFriends", arguments);
}

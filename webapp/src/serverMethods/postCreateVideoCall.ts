import { callMethod } from "@/lib/callMethod";

export function postCreateVideoCall(authenticatedUserIds: number[]) {
    return callMethod("postCreateVideoCall", arguments);
}

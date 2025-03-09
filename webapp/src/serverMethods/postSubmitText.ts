import { callMethod } from "@/lib/callMethod";

export function postSubmitTextChatMessage(authenticatedUserIds: number[], message: string) {
    return callMethod("postSubmitTextChatMessage", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function postUpdateTemporaryChatPopupShown(data?: any): Promise<void> {
    return callMethod("postUpdateTemporaryChatPopupShown", arguments);
}

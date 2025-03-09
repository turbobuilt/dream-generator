import { callMethod } from "@/lib/callMethod";

export function getChatMessages(data?: any) {
    return callMethod("getChatMessages", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function postEndVideoChat(data: { callRoomId: any; }) {
    return callMethod("postEndVideoChat", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function postRejectVideoChat(data: { callRoomId: any; candidate: any; sdp: any; }) {
    return callMethod("postRejectVideoChat", arguments);
}

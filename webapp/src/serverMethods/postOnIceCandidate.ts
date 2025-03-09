import { callMethod } from "@/lib/callMethod";

export function postOnIceCandidate(data: { callRoomId: any; candidate: any; }) {
    return callMethod("postOnIceCandidate", arguments);
}

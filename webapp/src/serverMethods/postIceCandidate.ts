import { callMethod } from "@/lib/callMethod";

export function postIceCandidate(data: { callRoomId: any; candidate: any; sdp: any; sdpId: any; remoteSdpId: any; }) {
    return callMethod("postIceCandidate", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function postVideoChatSdpOffer(data: { callRoomId: number; offer?: any; sdpId: number; }) {
    return callMethod("postVideoChatSdpOffer", arguments);
}

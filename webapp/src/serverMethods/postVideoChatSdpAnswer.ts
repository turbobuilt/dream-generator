import { callMethod } from "@/lib/callMethod";

export function postVideoChatSdpAnswer(data: { callRoomId: number; answer?: any; sdpId?: number; remoteSdpId?: number; }) {
    return callMethod("postVideoChatSdpAnswer", arguments);
}

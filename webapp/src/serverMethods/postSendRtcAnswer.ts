import { callMethod } from "@/lib/callMethod";

export function postSendRtcAnswer(data: { sdp: any; callRoomId: any; }) {
    return callMethod("postSendRtcAnswer", arguments);
}

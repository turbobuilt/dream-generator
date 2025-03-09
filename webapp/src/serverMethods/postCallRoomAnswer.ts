import { callMethod } from "@/lib/callMethod";

export function postCallRoomAnswer(data: { sdp: any; }, callRoomId: any) {
    return callMethod("postCallRoomAnswer", arguments);
}

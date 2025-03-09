import { callMethod } from "@/lib/callMethod";

export function postManageCallRoom(data: { callRoomId: number; authenticatedUserIds: number[]; sdp?: any; offer?: any; }) {
    return callMethod("postManageCallRoom", arguments);
}

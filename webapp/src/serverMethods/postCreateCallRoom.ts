import { callMethod } from "@/lib/callMethod";

export function postCreateCallRoom(data: { callRoomId: number; authenticatedUserIds: number[]; }) {
    return callMethod("postCreateCallRoom", arguments);
}

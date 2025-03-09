import { callMethod } from "@/lib/callMethod";

export function postRejectVideoCall({ callRoomId }: { callRoomId: any; }): Promise<void> {
    return callMethod("postRejectVideoCall", arguments);
}

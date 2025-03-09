import { callMethod } from "@/lib/callMethod";

export default function postRemoveFriend(data?: any): Promise<void> {
    return callMethod("postRemoveFriend", arguments);
}

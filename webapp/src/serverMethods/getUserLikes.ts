import { callMethod } from "@/lib/callMethod";

export default function getUserLikes(data?: any): Promise<void> {
    return callMethod("getUserLikes", arguments);
}

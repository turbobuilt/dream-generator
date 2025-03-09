import { callMethod } from "@/lib/callMethod";

export function postUserProfilePicture(data?: any): Promise<void> {
    return callMethod("postUserProfilePicture", arguments);
}

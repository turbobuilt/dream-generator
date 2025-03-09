import { callMethod } from "@/lib/callMethod";

export function postCheckIfUserIsAvailableForVideo({ userId }: { userId: any; }) {
    return callMethod("postCheckIfUserIsAvailableForVideo", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function unlikeShare(data?: any): Promise<any> {
    return callMethod("unlikeShare", arguments);
}

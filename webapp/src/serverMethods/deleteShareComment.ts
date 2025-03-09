import { callMethod } from "@/lib/callMethod";

export function deleteShareComment(data?: any): Promise<any> {
    return callMethod("deleteShareComment", arguments);
}

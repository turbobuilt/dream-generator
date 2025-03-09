import { callMethod } from "@/lib/callMethod";

export function saveShareEmail(data?: any): Promise<any> {
    return callMethod("saveShareEmail", arguments);
}

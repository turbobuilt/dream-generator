import { callMethod } from "@/lib/callMethod";

export function setName(data?: any): Promise<any> {
    return callMethod("setName", arguments);
}

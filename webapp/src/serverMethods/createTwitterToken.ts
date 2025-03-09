import { callMethod } from "@/lib/callMethod";

export function createTwitterToken(data?: any): Promise<any> {
    return callMethod("createTwitterToken", arguments);
}

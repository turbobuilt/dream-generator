import { callMethod } from "@/lib/callMethod";

export function getShare(data: { id: number; }): Promise<any> {
    return callMethod("getShare", arguments);
}

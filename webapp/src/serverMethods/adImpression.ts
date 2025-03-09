import { callMethod } from "@/lib/callMethod";

export function adImpression(data?: any): Promise<any> {
    return callMethod("adImpression", arguments);
}

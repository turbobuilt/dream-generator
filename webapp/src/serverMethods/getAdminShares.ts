import { callMethod } from "@/lib/callMethod";

export function getAdminShares(data?: any): Promise<any> {
    return callMethod("getAdminShares", arguments);
}

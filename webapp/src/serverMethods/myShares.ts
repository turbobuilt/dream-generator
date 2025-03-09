import { callMethod } from "@/lib/callMethod";

export function myShares(data: { page: number; perPage: number; }): Promise<void> {
    return callMethod("myShares", arguments);
}

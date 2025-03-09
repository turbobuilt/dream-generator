import { callMethod } from "@/lib/callMethod";

export function getNotifications({ page, perPage }: { page: any; perPage: any; }): Promise<{ items: any; }> {
    return callMethod("getNotifications", arguments);
}

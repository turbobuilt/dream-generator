import { callMethod } from "@/lib/callMethod";

export function updateCloudSync(data?: any): Promise<void> {
    return callMethod("updateCloudSync", arguments);
}

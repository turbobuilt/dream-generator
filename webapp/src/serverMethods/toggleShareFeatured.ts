import { callMethod } from "@/lib/callMethod";

export function toggleShareFeatured(data?: any): Promise<any> {
    return callMethod("toggleShareFeatured", arguments);
}

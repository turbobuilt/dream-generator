import { callMethod } from "@/lib/callMethod";

export function deleteShare(data: { id: number; }) {
    return callMethod("deleteShare", arguments);
}

import { callMethod } from "@/lib/callMethod";

export function reportObjectionableContent(data: Function | { shareId: number; reason: string; }) {
    return callMethod("reportObjectionableContent", arguments);
}

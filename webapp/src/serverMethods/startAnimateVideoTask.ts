import { callMethod } from "@/lib/callMethod";

export function startAnimateVideoTask(animateVideoRequest: any): Promise<void> {
    return callMethod("startAnimateVideoTask", arguments);
}

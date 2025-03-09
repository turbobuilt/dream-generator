import { callMethod } from "@/lib/callMethod";

export function saveUserData(next: NextFunction) {
    return callMethod("saveUserData", arguments);
}

import { callMethod } from "@/lib/callMethod";

export default function getAppPlans(data?: any): Promise<any> {
    return callMethod("getAppPlans", arguments);
}

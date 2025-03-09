import { callMethod } from "@/lib/callMethod";

export function userAgreesToTerms(data?: any): Promise<any> {
    return callMethod("userAgreesToTerms", arguments);
}

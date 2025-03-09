import { callMethod } from "@/lib/callMethod";

export function postSearchPeople(search: any, options: any): Promise<any> {
    return callMethod("postSearchPeople", arguments);
}

import { callMethod } from "@/lib/callMethod";

export default function testMethod({name, email, password}: { name: string; email: string; password: string; }): void {
    return callMethod("testMethod", arguments);
}

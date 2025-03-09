import { callMethod } from "@/lib/callMethod";

export function postAddUserToOrganization(data: { user: { email: string; permissions: string[]; }; organization: number; }): Promise<void> {
    return callMethod("postAddUserToOrganization", arguments);
}

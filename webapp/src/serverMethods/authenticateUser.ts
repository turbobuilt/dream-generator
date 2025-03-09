import { callMethod } from "@/lib/callMethod";

export function authenticateUserInternal(data?: any): Promise<{ success: boolean; error?: string; }> {
    return callMethod("authenticateUserInternal", arguments);
}

export function authenticateUser(next: NextFunction): Promise<void> {
    return callMethod("authenticateUser", arguments);
}

export function tryAuthenticateUser(next: NextFunction): Promise<void> {
    return callMethod("tryAuthenticateUser", arguments);
}

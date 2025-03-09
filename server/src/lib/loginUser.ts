import { AuthToken } from "../models/AuthToken";
import { AuthenticatedUser } from "../models/AuthenticatedUser";

export async function loginUser(authenticatedUserId) {
    const authToken = new AuthToken();
    await authToken.generate(authenticatedUserId);
    let authenticatedUser = new AuthenticatedUser();
    let [[data]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [authenticatedUserId]);
    Object.assign(authenticatedUser, data);
    return { authenticatedUser: authenticatedUser.getClientSafeUser(), token: authToken.token, plan: authenticatedUser.plan, creditsRemaining: authenticatedUser.creditsRemaining };
}
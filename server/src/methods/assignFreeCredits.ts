import { AuthenticatedUser } from "../models/AuthenticatedUser";
import { CreditLog } from "../models/CreditLog";

export async function assignNewUserFreeCredits(authenticatedUser: AuthenticatedUser) {
    // give 25 credits
    let freeCredits = 8;
    let creditLog = new CreditLog({ authenticatedUser: authenticatedUser.id, credits: freeCredits });
    await creditLog.save();
    await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = COALESCE(creditsRemaining, 0) + ? WHERE id = ?`, [freeCredits, authenticatedUser.id]);
    let [[info]] = await global.db.query(`SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?`, [authenticatedUser.id]);
    authenticatedUser.creditsRemaining = info.creditsRemaining;

    return authenticatedUser;
}
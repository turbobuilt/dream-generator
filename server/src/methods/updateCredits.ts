import { applePlans } from "./verifyIosTransaction";

export async function addCredits(userId, applePlanId) {
    let planInfo = applePlans[applePlanId];
    let newCredits = planInfo.credits;
    // let [[authenticatedUser]] = await global.db.query('SELECT creditsRemaining FROM AuthenticatedUser WHERE id = ?', [userId]);
    // // roll over up to 70% of newCredits.  If credits are more than 2x, cap
    // let creditsRemaining = authenticatedUser.creditsRemaining;
    // let rollOver = Math.min(newCredits * 0.7, creditsRemaining);
    // let credits = Math.min(newCredits + rollOver, newCredits * 2);
    // console.log("adding credits")
    console.log("User id is", userId, newCredits)
    await global.db.query('update AuthenticatedUser set creditsRemaining = COALESCE(creditsRemaining,0) + ?, plan=? WHERE id=?', [newCredits, planInfo.id, userId]);

    const [[results]] = await global.db.query('select creditsRemaining from AuthenticatedUser where id=?', userId);
    console.log("the credits are", results);
    return { creditsRemaining: results.creditsRemaining, newCredits };
}
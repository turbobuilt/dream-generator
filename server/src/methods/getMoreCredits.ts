export async function getMoreCredits(req, res) {
    let [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
    console.log("Giving more credits")


    if(!authenticatedUser.freeCreditsRoundTwo) {
        authenticatedUser.freeCreditsRoundTwo = 1;
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining+10, freeCreditsRoundTwo = ? WHERE id = ?`, [authenticatedUser.freeCreditsRoundTwo, authenticatedUser.id]);
        [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
        return res.json({ creditsRemaining: authenticatedUser.creditsRemaining, freeCreditsRoundTwo: authenticatedUser.freeCreditsRoundTwo, freeCreditsRoundThree: authenticatedUser.freeCreditsRoundThree });
    } else if(!authenticatedUser.freeCreditsRoundThree) {
        authenticatedUser.freeCreditsRoundThree = 1;
        await global.db.query(`UPDATE AuthenticatedUser SET creditsRemaining = creditsRemaining+10, freeCreditsRoundThree = ? WHERE id = ?`, [authenticatedUser.freeCreditsRoundThree, authenticatedUser.id]);
        [[authenticatedUser]] = await global.db.query(`SELECT * FROM AuthenticatedUser WHERE id = ?`, [req.authenticatedUser.id]);
        return res.json({ creditsRemaining: authenticatedUser.creditsRemaining, freeCreditsRoundTwo: authenticatedUser.freeCreditsRoundTwo, freeCreditsRoundThree: authenticatedUser.freeCreditsRoundThree });
    }
    return res.json({ error: "No more free credits available. Please subscribe. We can't afford to give any more free." });

}

export const route = {
    url: "/api/get-more-credits",
    method: "GET",
    authenticated: true
}
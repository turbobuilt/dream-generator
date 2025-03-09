
export async function getAuthenticatedUser(req, res) {
    let { authenticatedUser } = req;
    if (!authenticatedUser) {
        res.json({ error: "no authenticated user" });
        return;
    }
    delete authenticatedUser.passwordHash;
    delete authenticatedUser.pushToken;
    authenticatedUser.creditsRemaining = parseFloat(authenticatedUser.creditsRemaining) || 0;

    res.json({ authenticatedUser });
}

export const route = { url: "/api/authenticated-user", method: "GET", authenticated: true }